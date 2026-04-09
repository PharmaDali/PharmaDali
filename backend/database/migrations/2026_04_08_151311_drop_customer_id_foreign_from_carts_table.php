<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->dropCustomerForeignKeyIfExists();
        $this->ensureCustomersExistForLegacyCartUserIds();
        $this->remapCartCustomerIdsFromUsersToCustomers();

        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropCustomerForeignKeyIfExists();
        $this->remapCartCustomerIdsFromCustomersToUsers();

        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    private function ensureCustomersExistForLegacyCartUserIds(): void
    {
        DB::statement(<<<'SQL'
            INSERT INTO customers (user_id, created_at, updated_at)
            SELECT DISTINCT u.id, NOW(), NOW()
            FROM carts c
            INNER JOIN users u ON u.id = c.customer_id
            LEFT JOIN customers existing_customer_id ON existing_customer_id.id = c.customer_id
            LEFT JOIN customers existing_user_customer ON existing_user_customer.user_id = u.id
            WHERE existing_customer_id.id IS NULL
              AND existing_user_customer.id IS NULL
        SQL);
    }

    private function remapCartCustomerIdsFromUsersToCustomers(): void
    {
        DB::statement(<<<'SQL'
            UPDATE carts c
            INNER JOIN users u ON u.id = c.customer_id
            LEFT JOIN customers existing_customer_id ON existing_customer_id.id = c.customer_id
            INNER JOIN customers target_customer ON target_customer.user_id = u.id
            SET c.customer_id = target_customer.id
            WHERE existing_customer_id.id IS NULL
        SQL);
    }

    private function remapCartCustomerIdsFromCustomersToUsers(): void
    {
        DB::statement(<<<'SQL'
            UPDATE carts c
            INNER JOIN customers customer ON customer.id = c.customer_id
            SET c.customer_id = customer.user_id
        SQL);
    }

    private function dropCustomerForeignKeyIfExists(): void
    {
        $databaseName = DB::getDatabaseName();

        if (! $databaseName) {
            return;
        }

        $foreignKeys = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('CONSTRAINT_NAME')
            ->where('TABLE_SCHEMA', $databaseName)
            ->where('TABLE_NAME', 'carts')
            ->where('COLUMN_NAME', 'customer_id')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->pluck('CONSTRAINT_NAME');

        if ($foreignKeys->isEmpty()) {
            return;
        }

        Schema::table('carts', function (Blueprint $table) use ($foreignKeys) {
            foreach ($foreignKeys as $foreignKeyName) {
                $table->dropForeign((string) $foreignKeyName);
            }
        });
    }
};
