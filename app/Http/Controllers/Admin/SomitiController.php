<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SomitiStoreRequest;
use App\Http\Requests\Admin\SomitiUpdateRequest;
use App\Models\AppSetting;
use App\Models\Contribution;
use App\Models\ContributionCycle;
use App\Models\Draw;
use App\Models\Member;
use App\Models\Somiti;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SomitiController extends Controller
{
    protected function publicStorageUrl(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }

    public function index(Request $request): Response
    {
        $q = trim((string) $request->string('q'));

        $somitis = Somiti::query()
            ->when($q !== '', fn ($query) => $query->where('name', 'like', "%{$q}%"))
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Somiti $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'currency' => $s->currency,
                'monthly_amount' => $s->monthly_amount,
                'created_at' => $s->created_at?->toISOString(),
            ]);

        return Inertia::render('somitis/index', [
            'filters' => ['q' => $q],
            'somitis' => $somitis,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('somitis/create', [
            'defaults' => [
                'currency' => AppSetting::get('default_currency', 'BDT'),
            ],
        ]);
    }

    public function store(SomitiStoreRequest $request)
    {
        $somiti = Somiti::query()->create([
            'name' => $request->string('name'),
            'currency' => strtoupper($request->string('currency')->toString()),
            'monthly_amount' => $request->input('monthly_amount') !== null
                ? (float) $request->input('monthly_amount')
                : null,
            'created_by' => $request->user()?->id,
        ]);

        return redirect()->route('somitis.show', $somiti);
    }

    public function show(Somiti $somiti): Response
    {
        $month = CarbonImmutable::now()->format('Y-m');
        $cycleId = ContributionCycle::query()
            ->where('somiti_id', $somiti->id)
            ->where('month', $month)
            ->value('id');

        $membersTotal = Member::query()->where('somiti_id', $somiti->id)->count();
        $membersActive = Member::query()
            ->where('somiti_id', $somiti->id)
            ->where('is_active', true)
            ->count();

        $paidCount = $cycleId
            ? Contribution::query()
                ->where('cycle_id', $cycleId)
                ->whereNotNull('paid_at', 'and')
                ->count()
            : 0;

        $collectedAmount = $cycleId
            ? (float) Contribution::query()
                ->where('cycle_id', $cycleId)
                ->whereNotNull('paid_at', 'and')
                ->sum('amount')
            : 0.0;

        $lastDraw = Draw::query()
            ->with(['cycle', 'winner'])
            ->whereHas('cycle', fn ($q) => $q->where('somiti_id', $somiti->id))
            ->latest('id')
            ->first();

        return Inertia::render('somitis/show', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'stats' => [
                'month' => $month,
                'members_total' => $membersTotal,
                'members_active' => $membersActive,
                'paid' => $paidCount,
                'unpaid' => max(0, $membersActive - $paidCount),
                'collected_amount' => $collectedAmount,
                'last_draw' => $lastDraw ? [
                    'id' => $lastDraw->id,
                    'month' => $lastDraw->cycle?->month,
                    'winner_name' => $lastDraw->winner?->name,
                    'pot_amount' => $lastDraw->pot_amount,
                ] : null,
            ],
        ]);
    }

    public function edit(Somiti $somiti): Response
    {
        // Ensure default sounds exist in public storage (storage/app/public/audio)
        // so everything is selectable from the same folder.
        $publicDisk = Storage::disk('public');
        $publicDisk->makeDirectory('audio');

        foreach ([
            ['public' => public_path('audio/spin.mp3'), 'target' => 'audio/spin.mp3'],
            ['public' => public_path('audio/applause.mp3'), 'target' => 'audio/applause.mp3'],
        ] as $f) {
            if (! $publicDisk->exists($f['target']) && is_file($f['public'])) {
                $publicDisk->put($f['target'], file_get_contents($f['public']));
            }
        }

        $soundFiles = collect($publicDisk->files('audio'))
            ->filter(fn (string $p) => preg_match('/\.(mp3|wav|ogg)$/i', $p))
            ->values()
            ->map(fn (string $p) => [
                'path' => $p,
                'name' => basename($p),
                'url' => $this->publicStorageUrl($p),
            ]);

        return Inertia::render('somitis/edit', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
                'spin_sound_path' => $somiti->spin_sound_path,
                'celebration_sound_path' => $somiti->celebration_sound_path,
            ],
            'sounds' => [
                'options' => $soundFiles,
                'defaults' => [
                    'spin' => $publicDisk->exists('audio/spin.mp3')
                        ? $this->publicStorageUrl('audio/spin.mp3')
                        : '/audio/spin.mp3',
                    'celebration' => $publicDisk->exists('audio/applause.mp3')
                        ? $this->publicStorageUrl('audio/applause.mp3')
                        : '/audio/applause.mp3',
                ],
            ],
        ]);
    }

    public function update(SomitiUpdateRequest $request, Somiti $somiti)
    {
        $publicDisk = Storage::disk('public');
        $publicDisk->makeDirectory('audio');

        $spinPath = $request->string('spin_sound')->toString() ?: null;
        $celebrationPath = $request->string('celebration_sound')->toString() ?: null;

        if ($request->hasFile('spin_sound_file')) {
            $spinPath = $request->file('spin_sound_file')->store('audio', 'public');
        }
        if ($request->hasFile('celebration_sound_file')) {
            $celebrationPath = $request->file('celebration_sound_file')->store('audio', 'public');
        }

        $somiti->update([
            'name' => $request->string('name'),
            'currency' => strtoupper($request->string('currency')->toString()),
            'monthly_amount' => $request->input('monthly_amount') !== null
                ? (float) $request->input('monthly_amount')
                : null,
            'spin_sound_path' => $spinPath ?: null,
            'celebration_sound_path' => $celebrationPath ?: null,
        ]);

        return redirect()->route('somitis.show', $somiti);
    }

    public function destroy(Request $request, Somiti $somiti)
    {
        DB::transaction(function () use ($somiti) {
            // Important: `draws.winner_member_id` is `restrictOnDelete()`, while members are
            // `cascadeOnDelete()` from somiti. Delete draws first to avoid FK violations.
            $somiti->draws()->delete();

            // These cascades handle contributions/draws too, but we keep explicit ordering
            // for safety across different DB engines/settings.
            $somiti->cycles()->delete();
            $somiti->members()->delete();

            $somiti->deleteOrFail();
        });

        return redirect()
            ->route('somitis.index')
            ->with('success', 'Somiti deleted.');
    }
}

