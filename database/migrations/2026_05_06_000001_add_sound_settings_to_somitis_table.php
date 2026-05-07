<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->string('spin_sound_path')->nullable()->after('currency');
            $table->string('celebration_sound_path')->nullable()->after('spin_sound_path');
        });
    }

    public function down(): void
    {
        Schema::table('somitis', function (Blueprint $table) {
            $table->dropColumn(['spin_sound_path', 'celebration_sound_path']);
        });
    }
};

