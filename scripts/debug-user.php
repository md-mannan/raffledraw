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

echo "installed=".(App\Models\AppSetting::get('installed', false) ? '1' : '0')."\n";
echo "id=".$u->id."\n";
echo "email=".$u->email."\n";
echo "role=".$u->role."\n";
echo "is_admin=".(int) $u->is_admin."\n";
echo "verified=".($u->email_verified_at ? $u->email_verified_at->toDateTimeString() : 'null')."\n";

