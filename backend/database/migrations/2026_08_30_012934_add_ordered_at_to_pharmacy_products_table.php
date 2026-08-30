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
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->timestamp('ordered_at')->nullable()->after('lead_time_days')->comment('Stopwatch for lead time EMA calculation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->dropColumn('ordered_at');
        });
    }
};
