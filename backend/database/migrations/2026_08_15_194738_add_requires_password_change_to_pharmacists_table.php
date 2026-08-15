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
        Schema::table('pharmacists', function (Blueprint $table) {
            $table->boolean('requires_password_change')->default(false)->after('permissions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacists', function (Blueprint $table) {
            $table->dropColumn('requires_password_change');
        });
    }
};
