<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // If roles exist, ensure at least one super_admin. Otherwise fall back to is_admin.
        $hasRoleColumn = DB::getSchemaBuilder()->hasColumn('users', 'role');
        $hasAdmin = $hasRoleColumn
            ? (bool) DB::table('users')->where('role', 'super_admin')->exists()
            : (bool) DB::table('users')->where('is_admin', true)->exists();

        if ($hasAdmin) {
            return;
        }

        $firstUserId = DB::table('users')->orderBy('id')->value('id');
        if ($firstUserId) {
            $updates = $hasRoleColumn
                ? ['role' => 'super_admin', 'is_admin' => true]
                : ['is_admin' => true];
            DB::table('users')->where('id', $firstUserId)->update($updates);
        }
    }

    public function down(): void
    {
        // no-op
    }
};

