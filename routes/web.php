<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\ContributionController;
use App\Http\Controllers\Admin\DrawController;
use App\Http\Controllers\Admin\SomitiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstallController;

Route::get('/install', [InstallController::class, 'show'])->name('install.show');
Route::post('/install', [InstallController::class, 'store'])->name('install.store');

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::middleware(['can:admin'])->group(function () {
        Route::get('/somitis', [SomitiController::class, 'index'])->name('somitis.index');
        Route::get('/somitis/create', [SomitiController::class, 'create'])->name('somitis.create');
        Route::post('/somitis', [SomitiController::class, 'store'])->name('somitis.store');
        Route::get('/somitis/{somiti}', [SomitiController::class, 'show'])->name('somitis.show');
        Route::get('/somitis/{somiti}/edit', [SomitiController::class, 'edit'])->name('somitis.edit');
        Route::put('/somitis/{somiti}', [SomitiController::class, 'update'])->name('somitis.update');
        Route::delete('/somitis/{somiti}', [SomitiController::class, 'destroy'])->name('somitis.destroy');

        Route::scopeBindings()->group(function () {
            Route::get('/somitis/{somiti}/members', [MemberController::class, 'index'])->name('somitis.members.index');
            Route::get('/somitis/{somiti}/members/create', [MemberController::class, 'create'])->name('somitis.members.create');
            Route::post('/somitis/{somiti}/members', [MemberController::class, 'store'])->name('somitis.members.store');
            Route::get('/somitis/{somiti}/members/{member}', [MemberController::class, 'show'])->name('somitis.members.show');
            Route::get('/somitis/{somiti}/members/{member}/edit', [MemberController::class, 'edit'])->name('somitis.members.edit');
            Route::put('/somitis/{somiti}/members/{member}', [MemberController::class, 'update'])->name('somitis.members.update');

            Route::get('/somitis/{somiti}/contributions', [ContributionController::class, 'index'])->name('somitis.contributions.index');
            Route::put('/somitis/{somiti}/contributions/{cycle}/members/{member}', [ContributionController::class, 'update'])
                ->withoutScopedBindings()
                ->name('somitis.contributions.update');

            Route::get('/somitis/{somiti}/draws', [DrawController::class, 'index'])->name('somitis.draws.index');
            Route::get('/somitis/{somiti}/draws/run', [DrawController::class, 'run'])->name('somitis.draws.run');
            Route::post('/somitis/{somiti}/draws/{cycle}', [DrawController::class, 'store'])->name('somitis.draws.store');
            Route::get('/somitis/{somiti}/draws/{draw}', [DrawController::class, 'show'])->name('somitis.draws.show');
            Route::delete('/somitis/{somiti}/draws/{draw}', [DrawController::class, 'destroy'])->name('somitis.draws.destroy');
        });
    });
});

require __DIR__.'/settings.php';
