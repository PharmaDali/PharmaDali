<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Renames all "branch" terminology to "pharmacy" in the database schema.
     *
     * Based on exact SHOW CREATE TABLE output for the current DB state.
     * Uses SET foreign_key_checks=0 within each statement call to allow
     * dropping indexes that MySQL's InnoDB internally treats as FK-backing.
     */
    public function up(): void
    {
        // ---------------------------------------------------------------
        // 1. Drop indexes that block column renames
        //    Use per-table combined ALTER TABLE to run within FK-checks-off context
        // ---------------------------------------------------------------

        // order_items: The unique key and order_id FK in one combined ALTER
        // (MySQL processes all clauses of a single ALTER TABLE atomically)
        DB::unprepared('SET foreign_key_checks = 0');
        DB::unprepared('ALTER TABLE order_items
            DROP FOREIGN KEY order_items_order_id_foreign,
            DROP KEY order_items_order_id_branch_product_id_unique');

        // cart_items: drop unique key
        DB::unprepared('ALTER TABLE cart_items DROP KEY cart_items_cart_id_product_id_unique');

        // product_batches: drop plain KEY
        DB::unprepared('ALTER TABLE product_batches DROP KEY product_batches_branch_product_id_foreign');

        // carts: drop plain KEY
        DB::unprepared('ALTER TABLE carts DROP KEY carts_branch_id_foreign');

        // branch_products: drop plain KEY
        DB::unprepared('ALTER TABLE branch_products DROP KEY branch_products_branch_id_foreign');

        DB::unprepared('SET foreign_key_checks = 1');

        // ---------------------------------------------------------------
        // 2. Rename the parent tables
        // ---------------------------------------------------------------
        Schema::rename('branches', 'pharmacies');
        Schema::rename('branch_products', 'pharmacy_products');

        // ---------------------------------------------------------------
        // 3. Rename columns in the parent tables
        // ---------------------------------------------------------------
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->renameColumn('branch_name', 'pharmacy_name');
        });

        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->renameColumn('branch_id', 'pharmacy_id');
        });

        // ---------------------------------------------------------------
        // 4. Rename FK columns in child tables
        // ---------------------------------------------------------------
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('branch_id', 'pharmacy_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->renameColumn('branch_id', 'pharmacy_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('branch_id', 'pharmacy_id');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->renameColumn('branch_id', 'pharmacy_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('branch_product_id', 'pharmacy_product_id');
        });

        Schema::table('product_batches', function (Blueprint $table) {
            $table->renameColumn('branch_product_id', 'pharmacy_product_id');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->renameColumn('product_id', 'pharmacy_product_id');
        });

        // ---------------------------------------------------------------
        // 5. Recreate indexes and the dropped order_id FK
        // ---------------------------------------------------------------
        DB::unprepared('ALTER TABLE pharmacy_products ADD KEY pharmacy_products_pharmacy_id_index (pharmacy_id)');
        DB::unprepared('ALTER TABLE users RENAME INDEX users_branch_id_foreign TO users_pharmacy_id_index');
        DB::unprepared('ALTER TABLE customers RENAME INDEX customers_branch_id_foreign TO customers_pharmacy_id_index');
        DB::unprepared('ALTER TABLE carts ADD KEY carts_pharmacy_id_index (pharmacy_id)');
        DB::unprepared('ALTER TABLE order_items ADD KEY order_items_pharmacy_product_id_index (pharmacy_product_id)');
        DB::unprepared('ALTER TABLE order_items ADD UNIQUE KEY order_items_order_id_pharmacy_product_id_unique (order_id, pharmacy_product_id)');
        DB::unprepared('ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE');
        DB::unprepared('ALTER TABLE product_batches ADD KEY product_batches_pharmacy_product_id_index (pharmacy_product_id)');
        DB::unprepared('ALTER TABLE cart_items ADD UNIQUE KEY cart_items_cart_id_pharmacy_product_id_unique (cart_id, pharmacy_product_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('SET foreign_key_checks = 0');
        DB::unprepared('ALTER TABLE order_items
            DROP FOREIGN KEY order_items_order_id_foreign,
            DROP KEY order_items_order_id_pharmacy_product_id_unique,
            DROP KEY order_items_pharmacy_product_id_index');
        DB::unprepared('ALTER TABLE cart_items DROP KEY cart_items_cart_id_pharmacy_product_id_unique');
        DB::unprepared('ALTER TABLE product_batches DROP KEY product_batches_pharmacy_product_id_index');
        DB::unprepared('ALTER TABLE carts DROP KEY carts_pharmacy_id_index');
        DB::unprepared('ALTER TABLE pharmacy_products DROP KEY pharmacy_products_pharmacy_id_index');
        DB::unprepared('SET foreign_key_checks = 1');

        // Rename columns back in child tables
        Schema::table('cart_items', function (Blueprint $table) {
            $table->renameColumn('pharmacy_product_id', 'product_id');
        });
        Schema::table('product_batches', function (Blueprint $table) {
            $table->renameColumn('pharmacy_product_id', 'branch_product_id');
        });
        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('pharmacy_product_id', 'branch_product_id');
        });
        Schema::table('carts', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'branch_id');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'branch_id');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'branch_id');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'branch_id');
        });
        Schema::table('pharmacy_products', function (Blueprint $table) {
            $table->renameColumn('pharmacy_id', 'branch_id');
        });
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->renameColumn('pharmacy_name', 'branch_name');
        });

        // Rename tables back
        Schema::rename('pharmacy_products', 'branch_products');
        Schema::rename('pharmacies', 'branches');

        // Restore original indexes
        DB::unprepared('ALTER TABLE users RENAME INDEX users_pharmacy_id_index TO users_branch_id_foreign');
        DB::unprepared('ALTER TABLE customers RENAME INDEX customers_pharmacy_id_index TO customers_branch_id_foreign');
        DB::unprepared('ALTER TABLE branch_products ADD KEY branch_products_branch_id_foreign (branch_id)');
        DB::unprepared('ALTER TABLE order_items ADD KEY order_items_branch_product_id_foreign (branch_product_id)');
        DB::unprepared('ALTER TABLE order_items ADD UNIQUE KEY order_items_order_id_branch_product_id_unique (order_id, branch_product_id)');
        DB::unprepared('ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE');
        DB::unprepared('ALTER TABLE product_batches ADD KEY product_batches_branch_product_id_foreign (branch_product_id)');
        DB::unprepared('ALTER TABLE carts ADD KEY carts_branch_id_foreign (branch_id)');
        DB::unprepared('ALTER TABLE cart_items ADD UNIQUE KEY cart_items_cart_id_product_id_unique (cart_id, product_id)');
    }
};
