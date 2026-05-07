<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MemberStoreRequest;
use App\Http\Requests\Admin\MemberUpdateRequest;
use App\Models\Member;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(Request $request, Somiti $somiti): Response
    {
        $q = trim((string) $request->string('q'));

        $members = Member::query()
            ->where('somiti_id', $somiti->id)
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            }))
            ->orderBy('is_active', 'desc')
            ->orderBy('won_at')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'phone' => $m->phone,
                'is_active' => $m->is_active,
                'joined_at' => optional($m->joined_at)->toDateString(),
                'won_at' => optional($m->won_at)?->toISOString(),
                'created_at' => $m->created_at?->toISOString(),
            ]);

        return Inertia::render('members/index', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'filters' => [
                'q' => $q,
            ],
            'members' => $members,
        ]);
    }

    public function create(Somiti $somiti): Response
    {
        return Inertia::render('members/create', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
        ]);
    }

    public function store(MemberStoreRequest $request, Somiti $somiti)
    {
        $member = Member::create([
            'somiti_id' => $somiti->id,
            'name' => $request->string('name'),
            'email' => $request->string('email')->toString() ?: null,
            'phone' => $request->string('phone')->toString() ?: null,
            'joined_at' => $request->date('joined_at'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('somitis.members.show', [$somiti, $member])
            ->with('success', 'Member created.');
    }

    public function show(Somiti $somiti, Member $member): Response
    {
        return Inertia::render('members/show', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'is_active' => $member->is_active,
                'joined_at' => optional($member->joined_at)->toDateString(),
                'won_at' => optional($member->won_at)?->toISOString(),
                'created_at' => $member->created_at?->toISOString(),
                'updated_at' => $member->updated_at?->toISOString(),
            ],
        ]);
    }

    public function edit(Somiti $somiti, Member $member): Response
    {
        return Inertia::render('members/edit', [
            'somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'currency' => $somiti->currency,
                'monthly_amount' => $somiti->monthly_amount,
            ],
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'is_active' => $member->is_active,
                'joined_at' => optional($member->joined_at)->toDateString(),
            ],
        ]);
    }

    public function update(MemberUpdateRequest $request, Somiti $somiti, Member $member)
    {
        $member->update([
            'name' => $request->string('name'),
            'email' => $request->string('email')->toString() ?: null,
            'phone' => $request->string('phone')->toString() ?: null,
            'joined_at' => $request->date('joined_at'),
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()
            ->route('somitis.members.show', [$somiti, $member])
            ->with('success', 'Member updated.');
    }
}

