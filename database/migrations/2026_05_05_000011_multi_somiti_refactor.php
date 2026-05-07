<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('currency')->constrained('users')->nullOnDelete();
            $table->decimal('monthly_amount', 12, 2)->nullable()->change();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('somiti_id')->after('id')->constrained('somitis')->cascadeOnDelete();
            $table->index(['somiti_id', 'is_active']);
        });

        Schema::table('contribution_cycles', function (Blueprint $table) {
            $table->foreignId('somiti_id')->after('id')->constrained('somitis')->cascadeOnDelete();
            $table->dropUnique(['month']);
            $table->unique(['somiti_id', 'month']);
        });
    }

    public function down(): void
    {
        // This migration is not safely reversible for production data.
    }
};

