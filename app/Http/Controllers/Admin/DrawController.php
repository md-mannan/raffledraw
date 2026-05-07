<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contribution;
use App\Models\ContributionCycle;
use App\Models\Draw;
use App\Models\DrawEntrant;
use App\Models\Member;
use App\Models\Somiti;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DrawController extends Controller
{
    protected function publicStorageUrl(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }

    public function index(Request $request, Somiti $somiti): Response
    {
        $draws = Draw::query()
            ->with(['cycle', 'winner'])
            ->whereHas('cycle', fn ($q) => $q->where('somiti_id', $somiti->id))
            ->latest('id')
            ->paginate(12)
            ->through(fn (Draw $d) => [
                'id' => $d->id,
                'month' => $d->cycle?->month,
                'pot_amount' => (int) $d->pot_amount,
                'winner' => $d->winner ? [
                    'id' => $d->winner->id,
                    'name' => $d->winner->name,
                ] : null,
                'created_at' => $d->created_at?->toISOString(),
            ]);

        return Inertia::render('draws/index', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'draws' => $draws,
        ]);
    }

    public function show(Somiti $somiti, Draw $draw): Response
    {
        $draw->load(['cycle', 'winner', 'entrants.member']);
        abort_if((int) ($draw->cycle?->somiti_id ?? 0) !== (int) $somiti->id, 404);

        $publicDisk = Storage::disk('public');

        // Avoid relying on APP_URL for generated asset URLs in production (mixed-content / wrong domain).
        // Serve via relative paths: /storage/... (preferred) or /audio/... (fallback).
        $spinPath = $somiti->spin_sound_path ?: 'audio/spin.mp3';
        $celebrationPath = $somiti->celebration_sound_path ?: 'audio/applause.mp3';

        $spinUrl = $publicDisk->exists($spinPath)
            ? $this->publicStorageUrl($spinPath)
            : '/audio/spin.mp3';

        $celebrationUrl = $publicDisk->exists($celebrationPath)
            ? $this->publicStorageUrl($celebrationPath)
            : '/audio/applause.mp3';

        return Inertia::render('draws/show', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
                'spin_sound_url' => $spinUrl,
                'celebration_sound_url' => $celebrationUrl,
            ],
            'draw' => [
                'id' => $draw->id,
                'month' => $draw->cycle->month,
                'pot_amount' => (int) $draw->pot_amount,
                'seed' => $draw->seed,
                'winner' => [
                    'id' => $draw->winner->id,
                    'name' => $draw->winner->name,
                ],
                'entrants' => $draw->entrants
                    ->sortBy('position')
                    ->values()
                    ->map(fn (DrawEntrant $e) => [
                        'member' => [
                            'id' => $e->member->id,
                            'name' => $e->member->name,
                        ],
                        'position' => $e->position,
                    ]),
                'created_at' => $draw->created_at?->toISOString(),
            ],
        ]);
    }

    public function run(Request $request, Somiti $somiti): Response
    {
        $month = trim((string) $request->string('month'));
        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            $month = CarbonImmutable::now()->format('Y-m');
        }

        $cycle = ContributionCycle::query()->firstOrCreate([
            'somiti_id' => $somiti->id,
            'month' => $month,
        ]);
        $existing = Draw::query()->where('cycle_id', $cycle->id)->first();

        $entrants = $this->eligibleEntrants($somiti, $cycle)
            ->map(fn (Member $m) => ['id' => $m->id, 'name' => $m->name]);

        $monthly = (float) ($somiti->monthly_amount ?? 0);

        return Inertia::render('draws/run', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'month' => $month,
            'cycle' => ['id' => $cycle->id, 'month' => $cycle->month],
            'already_drawn' => $existing ? [
                'id' => $existing->id,
            ] : null,
            'entrants' => $entrants,
            'summary' => [
                'entrants' => $entrants->count(),
                'pot_amount' => $entrants->count() * $monthly,
            ],
        ]);
    }

    public function store(Somiti $somiti, ContributionCycle $cycle)
    {
        abort_if((int) $cycle->somiti_id !== (int) $somiti->id, 404);

        $draw = DB::transaction(function () use ($cycle, $somiti) {
            $existing = Draw::query()->lockForUpdate()->where('cycle_id', $cycle->id)->first();
            abort_if($existing, 409, 'Draw already exists for this month.');

            $entrants = $this->eligibleEntrants($somiti, $cycle);
            abort_if($entrants->isEmpty(), 422, 'No eligible entrants.');

            $seed = Str::random(32);
            $winnerId = $this->pickWinnerId($seed, $entrants->pluck('id')->all());
            $potAmount = $entrants->count() * (float) $somiti->monthly_amount;

            $draw = Draw::query()->create([
                'cycle_id' => $cycle->id,
                'pot_amount' => $potAmount,
                'winner_member_id' => $winnerId,
                'seed' => $seed,
                'created_by' => Auth::id(),
            ]);

            foreach ($entrants->values() as $idx => $member) {
                DrawEntrant::query()->create([
                    'draw_id' => $draw->id,
                    'member_id' => $member->id,
                    'position' => $idx + 1,
                ]);
            }

            Member::query()->where('id', $winnerId)->update(['won_at' => now()]);

            return $draw;
        });

        return redirect()
            ->route('somitis.draws.show', [$somiti, $draw, 'wheel' => 1])
            ->with('success', 'Draw completed.');
    }

    public function destroy(Somiti $somiti, Draw $draw)
    {
        $draw->loadMissing(['cycle', 'winner']);
        abort_if((int) ($draw->cycle?->somiti_id ?? 0) !== (int) $somiti->id, 404);

        DB::transaction(function () use ($draw) {
            $winnerId = (int) ($draw->winner_member_id ?? 0);

            DrawEntrant::query()->where('draw_id', $draw->id)->delete();
            $draw->deleteOrFail();

            // If this was the only draw the member ever won, allow eligibility again.
            if ($winnerId > 0) {
                $hasOtherWins = Draw::query()
                    ->where('winner_member_id', $winnerId)
                    ->exists();

                if (! $hasOtherWins) {
                    Member::query()->whereKey($winnerId)->update(['won_at' => null]);
                }
            }
        });

        return redirect()
            ->route('somitis.draws.index', [$somiti])
            ->with('success', 'Draw history deleted.');
    }

    /**
     * @return \Illuminate\Support\Collection<int, Member>
     */
    protected function eligibleEntrants(Somiti $somiti, ContributionCycle $cycle)
    {
        $paidMemberIds = Contribution::query()
            ->where('cycle_id', $cycle->id)
            ->whereNotNull('paid_at', 'and')
            ->pluck('member_id');

        return Member::query()
            ->where('somiti_id', $somiti->id)
            ->whereIn('id', $paidMemberIds, 'and', false)
            ->where('is_active', true)
            ->whereNull('won_at', 'and', false)
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * @param  array<int>  $entrantIds
     */
    protected function pickWinnerId(string $seed, array $entrantIds): int
    {
        $hash = hash('sha256', $seed);
        $num = hexdec(substr($hash, 0, 8));
        $idx = $num % max(1, count($entrantIds));

        return (int) $entrantIds[$idx];
    }
}

