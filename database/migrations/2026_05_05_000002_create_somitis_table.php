<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('somitis', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Somiti');
            $table->decimal('monthly_amount', 12, 2)->nullable();
            $table->string('currency', 3)->default('BDT');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('somitis');
    }
};

