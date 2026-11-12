<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            if (!Schema::hasColumn('pharmacies', 'enable_online_payment')) {
                $table->boolean('enable_online_payment')->default(false)->after('gcash_number');
            }
        });

        // Automatically enable online payment only for pharmacies that already have complete GCash info
        if (
            Schema::hasColumn('pharmacies', 'enable_online_payment') &&
            Schema::hasColumn('pharmacies', 'payment_qr_code_path') &&
            Schema::hasColumn('pharmacies', 'gcash_name') &&
            Schema::hasColumn('pharmacies', 'gcash_number')
        ) {
            DB::table('pharmacies')
                ->whereNotNull('payment_qr_code_path')
                ->where('payment_qr_code_path', '!=', '')
                ->whereNotNull('gcash_name')
                ->where('gcash_name', '!=', '')
                ->whereNotNull('gcash_number')
                ->where('gcash_number', '!=', '')
                ->update(['enable_online_payment' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            if (Schema::hasColumn('pharmacies', 'enable_online_payment')) {
                $table->dropColumn('enable_online_payment');
            }
        });
    }
};
