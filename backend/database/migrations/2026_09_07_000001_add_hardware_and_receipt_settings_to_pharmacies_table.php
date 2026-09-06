<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->string('printer_name', 100)->nullable()->default('POS Thermal Printer (USB)')->after('accreditation_no');
            $table->boolean('print_after_payment')->default(false)->after('printer_name');
            $table->string('receipt_header', 255)->nullable()->after('print_after_payment');
            $table->text('receipt_footer')->nullable()->after('receipt_header');
            $table->string('receipt_sort_by', 50)->default('By Added Order')->after('receipt_footer');
            $table->boolean('show_discount_on_receipt')->default(true)->after('receipt_sort_by');
            $table->boolean('show_vat_breakdown_on_receipt')->default(true)->after('show_discount_on_receipt');
        });
    }

    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropColumn([
                'printer_name',
                'print_after_payment',
                'receipt_header',
                'receipt_footer',
                'receipt_sort_by',
                'show_discount_on_receipt',
                'show_vat_breakdown_on_receipt',
            ]);
        });
    }
};

