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
            $table->string('email')->nullable()->after('contact_number');
            $table->string('logo_path')->nullable()->after('email');
            $table->unsignedInteger('low_stock_threshold')->default(50)->after('closing_hour');
            $table->unsignedInteger('shortage_days_threshold')->default(7)->after('low_stock_threshold');
            $table->unsignedInteger('expiry_days_threshold')->default(30)->after('shortage_days_threshold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'logo_path',
                'low_stock_threshold',
                'shortage_days_threshold',
                'expiry_days_threshold',
            ]);
        });
    }
};
