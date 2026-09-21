<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('pharmacies', 'low_stock_threshold')) {
            Schema::table('pharmacies', function (Blueprint $table) {
                $table->unsignedInteger('low_stock_threshold')->default(10)->change();
            });

            // Update existing pharmacies that were left on the previous default of 50
            DB::table('pharmacies')
                ->where('low_stock_threshold', 50)
                ->update(['low_stock_threshold' => 10]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('pharmacies', 'low_stock_threshold')) {
            Schema::table('pharmacies', function (Blueprint $table) {
                $table->unsignedInteger('low_stock_threshold')->default(50)->change();
            });

            DB::table('pharmacies')
                ->where('low_stock_threshold', 10)
                ->update(['low_stock_threshold' => 50]);
        }
    }
};

