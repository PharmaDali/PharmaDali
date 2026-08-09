<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('is_enabled')->default(true)->after('category_name');
            $table->string('background_color', 20)->default('#e8f0fe')->after('is_enabled');
            $table->string('font_color', 20)->default('#000000')->after('background_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['is_enabled', 'background_color', 'font_color']);
        });
    }
};
