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
            if (!Schema::hasColumn('pharmacies', 'is_manually_closed')) {
                $table->boolean('is_manually_closed')->default(false)->after('is_active');
            }
        });

        Schema::table('pharmacists', function (Blueprint $table) {
            if (!Schema::hasColumn('pharmacists', 'is_on_duty')) {
                $table->boolean('is_on_duty')->default(true)->after('requires_password_change');
            }
            if (!Schema::hasColumn('pharmacists', 'duty_updated_at')) {
                $table->timestamp('duty_updated_at')->nullable()->after('is_on_duty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            if (Schema::hasColumn('pharmacies', 'is_manually_closed')) {
                $table->dropColumn('is_manually_closed');
            }
        });

        Schema::table('pharmacists', function (Blueprint $table) {
            $columns = array_filter(
                ['is_on_duty', 'duty_updated_at'],
                fn (string $col) => Schema::hasColumn('pharmacists', $col)
            );
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};

