<?php

namespace App\Http\Controllers;

use App\Models\Draw;
use App\Models\Member;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user?->can('admin') ?? false;

        if ($isAdmin) {
            $somitis = Somiti::query()
                ->latest('id')
                ->withCount('members')
                ->limit(8)
                ->get()
                ->map(fn (Somiti $s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'currency' => $s->currency,
                    'monthly_amount' => $s->monthly_amount,
                    'members_count' => (int) $s->members_count,
                ]);

            $stats = [
                'somitis' => Somiti::query()->count('*'),
                'members' => Member::query()->count('*'),
                'draws' => Draw::query()->count('*'),
            ];

            $recentDraws = Draw::query()
                ->with('cycle:id,somiti_id,month')
                ->latest('id')
                ->limit(5)
                ->get(['id', 'cycle_id', 'winner_member_id', 'seed', 'created_at'])
                ->map(fn (Draw $d) => [
                    'id' => $d->id,
                    'somiti_id' => (int) ($d->cycle?->somiti_id ?? 0),
                    'cycle_id' => $d->cycle_id,
                    'winner_member_id' => $d->winner_member_id,
                    'created_at' => $d->created_at?->toISOString(),
                ]);

            return Inertia::render('dashboard', [
                'mode' => 'admin',
                'stats' => $stats,
                'somitis' => $somitis,
                'recentDraws' => $recentDraws,
            ]);
        }

        // Member / view-only dashboard (minimal for now)
        return Inertia::render('dashboard', [
            'mode' => 'member',
        ]);
    }
}

