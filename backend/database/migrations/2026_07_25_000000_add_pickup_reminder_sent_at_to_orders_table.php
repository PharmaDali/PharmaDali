<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'pickup_reminder_sent_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('pickup_reminder_sent_at')->nullable()->after('scheduled_pickup_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'pickup_reminder_sent_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('pickup_reminder_sent_at');
            });
        }
    }
};
