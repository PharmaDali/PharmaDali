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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('branch_product_id')->constrained('branch_products');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price_snapshot', 10, 2)->default(0);
            $table->decimal('line_total', 10, 2)->default(0);
            $table->string('product_name');
            $table->timestamps();

            $table->unique(['order_id', 'branch_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
