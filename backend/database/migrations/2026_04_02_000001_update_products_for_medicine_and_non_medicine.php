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
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_type')->default('medicine')->after('id');
            $table->string('generic_name')->nullable()->change();
            $table->string('brand_name')->nullable()->change();
            $table->text('description')->nullable()->change();
            $table->string('form')->nullable()->change();
            $table->string('strength')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('product_type');
            $table->string('generic_name')->nullable(false)->change();
            $table->string('brand_name')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
            $table->string('form')->nullable(false)->change();
            $table->string('strength')->nullable(false)->change();
        });
    }
};
