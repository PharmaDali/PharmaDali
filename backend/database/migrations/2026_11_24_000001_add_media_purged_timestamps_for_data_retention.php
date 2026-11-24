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
            if (!Schema::hasColumn('orders', 'discount_id_purged_at')) {
                $table->timestamp('discount_id_purged_at')->nullable()->after('discount_id_image_path');
            }

            if (!Schema::hasColumn('orders', 'payment_receipt_purged_at')) {
                $table->timestamp('payment_receipt_purged_at')->nullable()->after('payment_receipt_image_path');
            }
        });

        Schema::table('order_item_prescriptions', function (Blueprint $table) {
            $table->string('prescription_image_path')->nullable()->change();

            if (!Schema::hasColumn('order_item_prescriptions', 'prescription_purged_at')) {
                $table->timestamp('prescription_purged_at')->nullable()->after('prescription_image_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'discount_id_purged_at')) {
                $table->dropColumn('discount_id_purged_at');
            }

            if (Schema::hasColumn('orders', 'payment_receipt_purged_at')) {
                $table->dropColumn('payment_receipt_purged_at');
            }
        });

        Schema::table('order_item_prescriptions', function (Blueprint $table) {
            if (Schema::hasColumn('order_item_prescriptions', 'prescription_purged_at')) {
                $table->dropColumn('prescription_purged_at');
            }
        });
    }
};
