<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('joined_at')->nullable();
            $table->timestamp('won_at')->nullable();
            $table->timestamps();

            $table->index(['is_active']);
            $table->index(['won_at']);
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};

