<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = App\Models\User::query()->latest('id')->first();
if (! $u) {
    echo "no users\n";
    exit(0);
}

$before = [
    'id' => $u->id,
    'role' => $u->role,
    'is_admin' => (int) $u->is_admin,
    'verified' => $u->email_verified_at?->toDateTimeString(),
];

$u->forceFill([
    'role' => 'super_admin',
    'is_admin' => true,
    'email_verified_at' => now(),
]);

$saved = $u->save();

$u->refresh();
$after = [
    'id' => $u->id,
    'role' => $u->role,
    'is_admin' => (int) $u->is_admin,
    'verified' => $u->email_verified_at?->toDateTimeString(),
];

echo "saved=".($saved ? '1' : '0')."\n";
echo "before=".json_encode($before)."\n";
echo "after=".json_encode($after)."\n";

