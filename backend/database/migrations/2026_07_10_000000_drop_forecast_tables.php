<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Note: Drops forecast tables if they happen to exist in legacy databases.
     */
    public function up(): void
    {
        Schema::dropIfExists('forecast_insights');
        Schema::dropIfExists('forecasts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: Feature removed
    }
};
