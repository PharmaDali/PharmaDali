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
            $table->enum('status', ['pending', 'reviewing', 'preparing', 'ready_for_pickup', 'completed', 'overdue', 'cancelled', 'stand_by'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'reviewing', 'preparing', 'ready_for_pickup', 'completed', 'overdue', 'cancelled'])->default('pending')->change();
        });
    }
};
