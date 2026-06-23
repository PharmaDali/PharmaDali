<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->constrained('pharmacies')->cascadeOnDelete();
        });

        // Data migration to ensure each pharmacy gets its own copy of a product
        $pharmacyProducts = DB::table('pharmacy_products')->orderBy('id')->get();

        $processedProductIds = [];

        foreach ($pharmacyProducts as $pp) {
            if (!in_array($pp->product_id, $processedProductIds)) {
                // First pharmacy to claim this product
                DB::table('products')
                    ->where('id', $pp->product_id)
                    ->update(['pharmacy_id' => $pp->pharmacy_id]);
                
                $processedProductIds[] = $pp->product_id;
            } else {
                // Product already claimed by another pharmacy, clone it
                $product = DB::table('products')->where('id', $pp->product_id)->first();
                if ($product) {
                    $newProductId = DB::table('products')->insertGetId([
                        'pharmacy_id'   => $pp->pharmacy_id,
                        'product_type'  => $product->product_type,
                        'product_name'  => $product->product_name,
                        'generic_name'  => $product->generic_name,
                        'brand_name'    => $product->brand_name,
                        'description'   => $product->description,
                        'form'          => $product->form,
                        'strength'      => $product->strength,
                        'size'          => $product->size,
                        'is_prescribed' => $product->is_prescribed,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);

                    // Update pharmacy_products to point to the new clone
                    DB::table('pharmacy_products')
                        ->where('id', $pp->id)
                        ->update(['product_id' => $newProductId]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['pharmacy_id']);
            $table->dropColumn('pharmacy_id');
        });
    }
};
