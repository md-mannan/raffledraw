<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContributionCycle extends Model
{
    protected $fillable = [
        'somiti_id',
        'month',
    ];

    public function somiti(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(Contribution::class, 'cycle_id');
    }

    /**
     * Used by scoped route model binding for routes like:
     * /somitis/{somiti}/contributions/{cycle}/members/{member}
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'contributions', 'cycle_id', 'member_id');
    }

    public function draw(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Draw::class, 'cycle_id');
    }
}

