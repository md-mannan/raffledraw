<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Draw extends Model
{
    protected $fillable = [
        'cycle_id',
        'pot_amount',
        'winner_member_id',
        'seed',
        'created_by',
    ];

    protected $casts = [
        'pot_amount' => 'decimal:2',
    ];

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(ContributionCycle::class, 'cycle_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'winner_member_id');
    }

    public function entrants(): HasMany
    {
        return $this->hasMany(DrawEntrant::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

