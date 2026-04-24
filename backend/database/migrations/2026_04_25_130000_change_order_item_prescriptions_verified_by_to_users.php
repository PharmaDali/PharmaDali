<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('order_item_prescriptions') || !Schema::hasColumn('order_item_prescriptions', 'verified_by')) {
            return;
        }

        $currentReferencedTable = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('REFERENCED_TABLE_NAME')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', 'order_item_prescriptions')
            ->where('COLUMN_NAME', 'verified_by')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->value('REFERENCED_TABLE_NAME');

        if ($currentReferencedTable === 'users') {
            return;
        }

        $constraintName = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('CONSTRAINT_NAME')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', 'order_item_prescriptions')
            ->where('COLUMN_NAME', 'verified_by')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->value('CONSTRAINT_NAME');

        if ($constraintName) {
            Schema::table('order_item_prescriptions', function (Blueprint $table) use ($constraintName) {
                $table->dropForeign($constraintName);
            });
        }

        // Preserve existing verifier values by remapping pharmacist IDs to their owning user IDs.
        DB::statement(
            "UPDATE order_item_prescriptions oip
             INNER JOIN pharmacists p ON p.id = oip.verified_by
             SET oip.verified_by = p.user_id"
        );

        Schema::table('order_item_prescriptions', function (Blueprint $table) {
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('order_item_prescriptions') || !Schema::hasColumn('order_item_prescriptions', 'verified_by')) {
            return;
        }

        $constraintName = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('CONSTRAINT_NAME')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', 'order_item_prescriptions')
            ->where('COLUMN_NAME', 'verified_by')
            ->where('REFERENCED_TABLE_NAME', 'users')
            ->value('CONSTRAINT_NAME');

        if ($constraintName) {
            Schema::table('order_item_prescriptions', function (Blueprint $table) use ($constraintName) {
                $table->dropForeign($constraintName);
            });
        }

        DB::statement(
            "UPDATE order_item_prescriptions oip
             INNER JOIN pharmacists p ON p.user_id = oip.verified_by
             SET oip.verified_by = p.id"
        );

        Schema::table('order_item_prescriptions', function (Blueprint $table) {
            $table->foreign('verified_by')->references('id')->on('pharmacists')->nullOnDelete();
        });
    }
};
