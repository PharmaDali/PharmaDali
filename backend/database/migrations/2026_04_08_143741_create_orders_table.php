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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->enum('status', ['pending', 'reviewing', 'preparing', 'ready_for_pickup',  'completed', 'overdue', 'cancelled'])->default('pending');
            $table->string('payment_method')->default('cash');
            $table->enum('payment_status', ['unpaid', 'paid', 'failed'])->default('unpaid');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->timestamp('scheduled_pickup_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('placed_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'status']);
            $table->index(['customer_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
