<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Gate::define('super_admin', fn (?User $user) => ($user?->role === 'super_admin') || (($user?->is_admin ?? false) === true));
        Gate::define('admin', fn (?User $user) => in_array($user?->role, ['super_admin', 'admin'], true) || (($user?->is_admin ?? false) === true));
    }
}

