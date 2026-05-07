<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Somiti extends Model
{
    protected $fillable = [
        'name',
        'monthly_amount',
        'currency',
        'created_by',
        'spin_sound_path',
        'celebration_sound_path',
    ];

    protected $casts = [
        'monthly_amount' => 'decimal:2',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function cycles(): HasMany
    {
        return $this->hasMany(ContributionCycle::class);
    }

    /**
     * Used by scoped route model binding for routes like:
     * /somitis/{somiti}/draws/{draw}
     */
    public function draws(): HasManyThrough
    {
        return $this->hasManyThrough(Draw::class, ContributionCycle::class, 'somiti_id', 'cycle_id', 'id', 'id');
    }
}

