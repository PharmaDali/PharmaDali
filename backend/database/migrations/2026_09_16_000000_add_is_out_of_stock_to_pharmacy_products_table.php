<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->boolean('is_out_of_stock')->default(false)->after('is_available');
        });

        // Initialize existing data:
        // If stock <= 0, mark is_out_of_stock = true (1)
        DB::table('pharmacy_products')
            ->where('stock', '<=', 0)
            ->update([
                'is_out_of_stock' => 1,
            ]);

        // If stock > 0, ensure is_out_of_stock = false (0) and is_available = true (1)
        DB::table('pharmacy_products')
            ->where('stock', '>', 0)
            ->update([
                'is_out_of_stock' => 0,
                'is_available'    => 1,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->dropColumn('is_out_of_stock');
        });
    }
};

