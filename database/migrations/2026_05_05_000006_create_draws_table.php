<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('draws', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('contribution_cycles')->cascadeOnDelete();
            $table->unsignedInteger('pot_amount');
            $table->foreignId('winner_member_id')->constrained('members')->restrictOnDelete();
            $table->string('seed', 64);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('cycle_id');
            // A member can only ever win once.
            // (Member IDs are globally unique; keeping this constraint is safe across Somitis.)
            $table->unique('winner_member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('draws');
    }
};

