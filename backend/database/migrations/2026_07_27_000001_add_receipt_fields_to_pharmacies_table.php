<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds BIR/POS compliance fields required for thermal receipt printing.
     */
    public function up(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->string('tin', 20)->nullable()->after('contact_number');
            $table->enum('vat_type', ['vat', 'non_vat'])->default('vat')->after('tin');
            $table->string('bir_permit_no', 50)->nullable()->after('vat_type');
            $table->date('permit_issued_at')->nullable()->after('bir_permit_no');
            $table->date('ptu_valid_until')->nullable()->after('permit_issued_at');
            $table->string('machine_no', 50)->nullable()->after('ptu_valid_until');
            $table->string('serial_no', 100)->nullable()->after('machine_no');
            $table->string('accreditation_no', 100)->nullable()->after('serial_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropColumn([
                'tin',
                'vat_type',
                'bir_permit_no',
                'permit_issued_at',
                'ptu_valid_until',
                'machine_no',
                'serial_no',
                'accreditation_no',
            ]);
        });
    }
};
