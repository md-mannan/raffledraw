<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContributionUpdateRequest;
use App\Models\Contribution;
use App\Models\ContributionCycle;
use App\Models\Member;
use App\Models\Somiti;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ContributionController extends Controller
{
    public function index(Request $request, Somiti $somiti): Response
    {
        $month = trim((string) $request->string('month'));
        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            $month = CarbonImmutable::now()->format('Y-m');
        }

        $cycle = ContributionCycle::query()->firstOrCreate([
            'somiti_id' => $somiti->id,
            'month' => $month,
        ]);

        $members = Member::query()
            ->where('somiti_id', $somiti->id)
            ->orderBy('is_active', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        $contributions = Contribution::query()
            ->where('cycle_id', $cycle->id)
            ->get()
            ->keyBy(fn (Contribution $c) => (string) $c->member_id);

        $collectedAmount = (float) Contribution::query()
            ->where('cycle_id', $cycle->id)
            ->whereNotNull('paid_at', 'and')
            ->sum('amount');

        $rows = $members->map(function (Member $m) use ($contributions) {
            /** @var Contribution|null $c */
            $c = $contributions->get((string) $m->id);

            return [
                'member' => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'is_active' => $m->is_active,
                    'won_at' => optional($m->won_at)?->toISOString(),
                ],
                'contribution' => $c ? [
                    'id' => $c->id,
                    'amount' => $c->amount,
                    'paid_at' => optional($c->paid_at)?->toISOString(),
                    'note' => $c->note,
                ] : null,
            ];
        });

        $paidCount = $rows->filter(fn ($r) => $r['contribution'] && $r['contribution']['paid_at'])->count();
        $totalMembers = $rows->count();
        $potAmount = $paidCount * (int) $somiti->monthly_amount;

        return Inertia::render('contributions/index', [
            'month' => $month,
            'cycle' => [
                'id' => $cycle->id,
                'month' => $cycle->month,
            ],
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'monthly_amount' => $somiti->monthly_amount,
                'currency' => $somiti->currency,
            ],
            'summary' => [
                'paid' => $paidCount,
                'unpaid' => max(0, $totalMembers - $paidCount),
                'total_members' => $totalMembers,
                'pot_amount' => $potAmount,
                'collected_amount' => $collectedAmount,
            ],
            'rows' => $rows,
        ]);
    }

    public function update(ContributionUpdateRequest $request, Somiti $somiti, ContributionCycle $cycle, Member $member)
    {
        abort_if((int) $cycle->somiti_id !== (int) $somiti->id, 404);
        abort_if((int) $member->somiti_id !== (int) $somiti->id, 404);

        DB::transaction(function () use ($request, $cycle, $member, $somiti) {
            $contribution = Contribution::query()->firstOrNew([
                'cycle_id' => $cycle->id,
                'member_id' => $member->id,
            ]);

            $amount = $request->input('amount');
            $contribution->amount = $amount !== null
                ? (float) $amount
                : (float) $somiti->monthly_amount;
            $contribution->note = $request->string('note')->toString() ?: null;
            $contribution->created_by = $request->user()?->id;

            if ($request->boolean('paid')) {
                $contribution->paid_at = $contribution->paid_at ?? now();
            } else {
                $contribution->paid_at = null;
            }

            $contribution->save();
        });

        return back()->with('success', 'Contribution updated.');
    }
}

