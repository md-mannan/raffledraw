<?php

namespace App\Http\Controllers;

use App\Http\Requests\Install\InstallRequest;
use App\Models\AppSetting;
use App\Models\User;
use App\Support\EnvEditor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class InstallController extends Controller
{
    public function show(): Response
    {
        abort_if((bool) AppSetting::get('installed', false), 404);

        $dbOk = false;
        $dbError = null;
        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (Throwable $e) {
            $dbOk = false;
            $dbError = $e->getMessage();
        }

        $storageWritable = is_writable(storage_path()) && is_writable(base_path('bootstrap/cache'));
        $envExists = file_exists(base_path('.env'));

        return Inertia::render('install/index', [
            'defaults' => [
                'currency' => 'BDT',
            ],
            'database' => [
                'connection' => config('database.default'),
                'database' => config('database.connections.'.config('database.default').'.database'),
                'host' => config('database.connections.'.config('database.default').'.host'),
                'port' => config('database.connections.'.config('database.default').'.port'),
                'ok' => $dbOk,
                'error' => $dbError,
            ],
            'requirements' => [
                'php' => PHP_VERSION,
                'storage_writable' => $storageWritable,
                'env_exists' => $envExists,
            ],
        ]);
    }

    public function store(InstallRequest $request)
    {
        abort_if((bool) AppSetting::get('installed', false), 409, 'Already installed.');

        // During installation the database/cache tables may not exist yet.
        // Avoid any dependency on the cache store while we bootstrap the app.
        config(['cache.default' => 'array']);

        // Collect env updates, but apply them only at the end.
        // Writing `.env` can trigger dev server reloads (e.g. `composer dev`),
        // which can interrupt the in-flight HTTP request on Windows.
        $envUpdates = [];

        $dbDriver = $request->string('db_driver')->toString();
        $dbDatabase = $request->string('db_database')->toString();

        if ($dbDriver === 'sqlite') {
            $sqlitePath = database_path($dbDatabase);
            if (! str_ends_with($sqlitePath, '.sqlite')) {
                $sqlitePath .= '.sqlite';
            }
            if (! file_exists($sqlitePath)) {
                @touch($sqlitePath);
            }

            $envUpdates += [
                'DB_CONNECTION' => 'sqlite',
                'DB_DATABASE' => $sqlitePath,
            ];

            config([
                'database.default' => 'sqlite',
                'database.connections.sqlite.database' => $sqlitePath,
            ]);
        } else {
            $envUpdates += [
                'DB_CONNECTION' => 'mysql',
                'DB_HOST' => $request->string('db_host')->toString(),
                'DB_PORT' => (string) $request->integer('db_port'),
                'DB_DATABASE' => $dbDatabase,
                'DB_USERNAME' => $request->string('db_username')->toString(),
                'DB_PASSWORD' => $request->string('db_password')->toString(),
            ];

            config([
                'database.default' => 'mysql',
                'database.connections.mysql.host' => $request->string('db_host')->toString(),
                'database.connections.mysql.port' => (string) $request->integer('db_port'),
                'database.connections.mysql.database' => $dbDatabase,
                'database.connections.mysql.username' => $request->string('db_username')->toString(),
                'database.connections.mysql.password' => $request->string('db_password')->toString(),
            ]);
        }

        // Update app branding in env (best-effort).
        $envUpdates += [
            'APP_NAME' => $request->string('app_name')->toString(),
        ];
        if ($request->filled('app_url')) {
            $envUpdates += [
                'APP_URL' => $request->string('app_url')->toString(),
            ];
        }

        // Reconnect with new settings.
        DB::purge();
        try {
            DB::reconnect();
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            return back()
                ->withErrors(['db_database' => 'Database connection failed: '.$e->getMessage()])
                ->withInput();
        }

        // Allow pre-existing tables (migrations already ran).
        // Block only if the app is already installed, or if there is already "real" app data.
        // Special case: if there's exactly 1 existing user (e.g. someone registered before install),
        // we will upgrade that user to Super Admin during installation.
        $existingBootstrapUserId = null;
        try {
            if (AppSetting::query()->exists()) {
                return back()
                    ->withErrors([
                        'db_database' => 'Existing data detected. Please use a fresh database or wipe it (e.g. migrate:fresh) before installing.',
                    ])
                    ->withInput();
            }

            $userCount = User::query()->count('*');
            if ($userCount === 1) {
                $existingBootstrapUserId = (int) User::query()->value('id');
            } elseif ($userCount > 1) {
                return back()
                    ->withErrors([
                        'db_database' => 'Existing users detected. Please use a fresh database or wipe it (e.g. migrate:fresh) before installing.',
                    ])
                    ->withInput();
            }
        } catch (Throwable $e) {
            // If tables don't exist yet, we'll create them below.
        }

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->storePubliclyAs(
                'branding',
                'logo-'.Str::random(8).'.'.$request->file('logo')->getClientOriginalExtension(),
                ['disk' => 'public'],
            );
        }

        // Ensure tables exist after possible sqlite switch / env update.
        Artisan::call('migrate', ['--force' => true]);

        $user = DB::transaction(function () use ($request, $logoPath, $existingBootstrapUserId) {
            AppSetting::set('installed', true);
            AppSetting::set('language', $request->string('language')->toString());
            AppSetting::set('app_name', $request->string('app_name')->toString());
            AppSetting::set('app_url', $request->string('app_url')->toString() ?: null);
            AppSetting::set('logo_path', $logoPath);
            AppSetting::set('default_currency', strtoupper($request->string('currency')->toString()));

            $payload = [
                'name' => $request->string('admin_name')->toString(),
                'email' => $request->string('admin_email')->toString(),
                'email_verified_at' => now(),
                'password' => Hash::make($request->string('admin_password')->toString()),
                'is_admin' => true,
                'role' => 'super_admin',
            ];

            if ($existingBootstrapUserId) {
                $u = User::query()->findOrFail($existingBootstrapUserId);
                $u->forceFill($payload)->save();

                return $u;
            }

            return User::query()->create($payload);
        });

        Auth::login($user);

        // Persist env changes last (best-effort).
        try {
            EnvEditor::setMany($envUpdates);
        } catch (Throwable) {
            // Ignore; runtime config + app settings are already persisted.
        }

        return redirect()->route('dashboard');
    }
}

