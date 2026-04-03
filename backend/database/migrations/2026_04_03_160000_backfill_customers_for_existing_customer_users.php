<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        $missingCustomerUsers = DB::table('users')
            ->leftJoin('customers', 'customers.user_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->whereNull('customers.id')
            ->select('users.id as user_id')
            ->get();

        if ($missingCustomerUsers->isEmpty()) {
            return;
        }

        $rows = $missingCustomerUsers
            ->map(fn ($row) => [
                'user_id' => $row->user_id,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        DB::table('customers')->insert($rows);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left blank to avoid deleting customer records created after this migration.
    }
};
