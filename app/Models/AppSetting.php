<?php

namespace App\Models;

use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Model;
use PDOException;

class AppSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            return static::query()->where('key', $key)->value('value') ?? $default;
        } catch (QueryException|PDOException) {
            // App not migrated yet (e.g., first-run installer).
            return $default;
        }
    }

    public static function set(string $key, mixed $value): void
    {
        try {
            static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        } catch (QueryException|PDOException) {
            // Ignore if settings table doesn't exist yet; installer will run migrations first.
        }
    }
}

