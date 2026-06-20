<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename tenant_id → pharmacy_id on forecasts and forecast_insights tables.
     *
     * Both tables originally had a FK to 'branches' (now 'pharmacies').
     * No explicit named indexes exist on tenant_id in the current DB — only the
     * compound unique key on forecast_insights references that column by name.
     */
    public function up(): void
    {
        DB::unprepared('SET foreign_key_checks = 0');

        // ── forecasts ──────────────────────────────────────────────────────────
        // The original migration created a FK to 'branches'. That table is now
        // 'pharmacies'. We rename the column and recreate the FK.
        // No separate named index on tenant_id exists for this table.
        Schema::table('forecasts', function (Blueprint $table) {
            $table->renameColumn('tenant_id', 'pharmacy_id');
        });

        // Add FK pointing at pharmacies
        DB::unprepared(
            'ALTER TABLE forecasts
             ADD CONSTRAINT forecasts_pharmacy_id_foreign
             FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id) ON DELETE SET NULL'
        );
        DB::unprepared('ALTER TABLE forecasts ADD INDEX forecasts_pharmacy_id_index (pharmacy_id)');

        // ── forecast_insights ──────────────────────────────────────────────────
        // Must drop the unique key that names 'tenant_id' before renaming.
        DB::unprepared('ALTER TABLE forecast_insights DROP INDEX forecast_insights_unique_key');

        Schema::table('forecast_insights', function (Blueprint $table) {
            $table->renameColumn('tenant_id', 'pharmacy_id');
        });

        // Recreate unique key with updated column name
        DB::unprepared(
            'ALTER TABLE forecast_insights
             ADD UNIQUE KEY forecast_insights_unique_key
             (pharmacy_id, week_start, demand_granularity, sales_granularity, model)'
        );

        // Add FK pointing at pharmacies + plain index
        DB::unprepared(
            'ALTER TABLE forecast_insights
             ADD CONSTRAINT forecast_insights_pharmacy_id_foreign
             FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id) ON DELETE SET NULL'
        );
        DB::unprepared('ALTER TABLE forecast_insights ADD INDEX forecast_insights_pharmacy_id_index (pharmacy_id)');

        DB::unprepared('SET foreign_key_checks = 1');
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        DB::unprepared('SET foreign_key_checks = 0');

        // ── forecast_insights ──────────────────────────────────────────────────
        DB::unprepared('ALTER TABLE forecast_insights DROP FOREIGN KEY forecast_insights_pharmacy_id_foreign');
        DB::unprepared('ALTER TABLE forecast_insights DROP INDEX forecast_insights_pharmacy_id_index');
        DB::unprepared('ALTER TABLE forecast_insights DROP INDEX forecast_insights_unique_key');

        Schema::table('forecast_insights', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'tenant_id');
        });

        DB::unprepared(
            'ALTER TABLE forecast_insights
             ADD UNIQUE KEY forecast_insights_unique_key
             (tenant_id, week_start, demand_granularity, sales_granularity, model)'
        );

        // ── forecasts ──────────────────────────────────────────────────────────
        DB::unprepared('ALTER TABLE forecasts DROP FOREIGN KEY forecasts_pharmacy_id_foreign');
        DB::unprepared('ALTER TABLE forecasts DROP INDEX forecasts_pharmacy_id_index');

        Schema::table('forecasts', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'tenant_id');
        });

        DB::unprepared('SET foreign_key_checks = 1');
    }
};
