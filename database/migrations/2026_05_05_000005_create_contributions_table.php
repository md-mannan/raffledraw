<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cycle_id')->constrained('contribution_cycles')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->timestamp('paid_at')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['member_id', 'cycle_id']);
            $table->index(['cycle_id', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contributions');
    }
};

