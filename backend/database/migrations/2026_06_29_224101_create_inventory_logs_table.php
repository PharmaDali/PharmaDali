<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->onDelete('cascade');
            $table->foreignId('pharmacy_product_id')->constrained('pharmacy_products')->onDelete('cascade');
            $table->foreignId('product_batch_id')->nullable()->constrained('product_batches')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('transaction_type', ['stock_in', 'stock_out', 'adjustment', 'waste']);
            $table->integer('quantity');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['pharmacy_id', 'created_at']);
            $table->index(['pharmacy_product_id', 'transaction_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
