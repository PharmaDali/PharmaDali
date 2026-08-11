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
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->unsignedInteger('item_exchange_window_days')->default(1)->after('enable_vat_exemption_discount');
            $table->boolean('allow_item_exchange')->default(true)->after('item_exchange_window_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropColumn(['item_exchange_window_days', 'allow_item_exchange']);
        });
    }
};
