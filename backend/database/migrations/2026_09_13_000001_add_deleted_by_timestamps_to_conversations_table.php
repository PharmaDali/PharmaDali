<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('conversations', 'deleted_by_customer_at')) {
                $table->timestamp('deleted_by_customer_at')->nullable()->after('closed_at');
            }
            if (!Schema::hasColumn('conversations', 'deleted_by_pharmacist_at')) {
                $table->timestamp('deleted_by_pharmacist_at')->nullable()->after('deleted_by_customer_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'deleted_by_pharmacist_at')) {
                $table->dropColumn('deleted_by_pharmacist_at');
            }
            if (Schema::hasColumn('conversations', 'deleted_by_customer_at')) {
                $table->dropColumn('deleted_by_customer_at');
            }
        });
    }
};

