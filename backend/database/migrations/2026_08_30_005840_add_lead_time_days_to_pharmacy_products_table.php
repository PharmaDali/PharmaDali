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
            $table->integer('lead_time_days')->nullable()->after('is_expired')->comment('Days it takes for the supplier to deliver this product to the pharmacy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->dropColumn('lead_time_days');
        });
    }
};
