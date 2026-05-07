<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        $installed = (bool) AppSetting::get('installed', false);

        if (! $installed && ! $request->is('install*')) {
            return redirect()->route('install.show');
        }

        if ($installed && $request->is('install*')) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}

