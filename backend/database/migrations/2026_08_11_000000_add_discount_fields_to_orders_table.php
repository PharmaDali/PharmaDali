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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('discount_type')->default('none')->after('subtotal');
            $table->decimal('discount_percentage', 5, 2)->default(0.00)->after('discount_type');
            $table->string('discount_id_number')->nullable()->after('discount_percentage');
            $table->string('discount_remarks')->nullable()->after('discount_id_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type',
                'discount_percentage',
                'discount_id_number',
                'discount_remarks',
            ]);
        });
    }
};
