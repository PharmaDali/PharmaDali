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
        Schema::create('item_exchanges', function (Blueprint $table) {
            $table->id();
            $table->string('exchange_number')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->onDelete('cascade');
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade');
            $table->decimal('total_returned_value', 10, 2)->default(0.00);
            $table->decimal('total_replacement_value', 10, 2)->default(0.00);
            $table->decimal('additional_payment', 10, 2)->default(0.00);
            $table->string('payment_method')->nullable();
            $table->decimal('amount_received', 10, 2)->default(0.00);
            $table->decimal('change_amount', 10, 2)->default(0.00);
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('exchange_returned_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_exchange_id')->constrained('item_exchanges')->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained('order_items')->onDelete('cascade');
            $table->foreignId('pharmacy_product_id')->constrained('pharmacy_products')->onDelete('cascade');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price_snapshot', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->string('condition')->default('resalable'); // resalable, damaged, expired
            $table->timestamps();
        });

        Schema::create('exchange_replacement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_exchange_id')->constrained('item_exchanges')->onDelete('cascade');
            $table->foreignId('pharmacy_product_id')->constrained('pharmacy_products')->onDelete('cascade');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price_snapshot', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_replacement_items');
        Schema::dropIfExists('exchange_returned_items');
        Schema::dropIfExists('item_exchanges');
    }
};
