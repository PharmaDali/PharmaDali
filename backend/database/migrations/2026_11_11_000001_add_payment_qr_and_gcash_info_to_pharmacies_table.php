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
            if (!Schema::hasColumn('pharmacies', 'payment_qr_code_path')) {
                $table->string('payment_qr_code_path')->nullable()->after('logo_path');
            }
            if (!Schema::hasColumn('pharmacies', 'gcash_name')) {
                $table->string('gcash_name', 100)->nullable()->after('payment_qr_code_path');
            }
            if (!Schema::hasColumn('pharmacies', 'gcash_number')) {
                $table->string('gcash_number', 30)->nullable()->after('gcash_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $columns = array_filter(
                ['payment_qr_code_path', 'gcash_name', 'gcash_number'],
                fn (string $col) => Schema::hasColumn('pharmacies', $col)
            );

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
