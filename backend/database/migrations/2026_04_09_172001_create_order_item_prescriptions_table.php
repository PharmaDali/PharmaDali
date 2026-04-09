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
        if (! Schema::hasTable('order_item_prescriptions')) {
            $this->createOrderItemPrescriptionsTable();

            return;
        }

        if (! Schema::hasColumn('order_item_prescriptions', 'order_item_id')) {
            Schema::drop('order_item_prescriptions');
            $this->createOrderItemPrescriptionsTable();

            return;
        }

        $this->addForeignIfMissing('order_item_id', 'order_items', 'id', 'cascade');
        $this->addForeignIfMissing('verified_by', 'pharmacists', 'id', null);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_prescriptions');
    }

    private function addForeignIfMissing(string $column, string $referencedTable, string $referencedColumn, ?string $onDelete): void
    {
        if ($this->foreignExists('order_item_prescriptions', $column, $referencedTable, $referencedColumn)) {
            return;
        }

        Schema::table('order_item_prescriptions', function (Blueprint $table) use ($column, $referencedTable, $referencedColumn, $onDelete) {
            $foreign = $table->foreign($column)->references($referencedColumn)->on($referencedTable);

            if ($onDelete === 'cascade') {
                $foreign->onDelete('cascade');
            }
        });
    }

    private function createOrderItemPrescriptionsTable(): void
    {
        Schema::create('order_item_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->onDelete('cascade');
            $table->string('prescription_image_path');
            $table->foreignId('verified_by')->nullable()->constrained('pharmacists');
            $table->timestamp('verified_at')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    private function foreignExists(string $tableName, string $column, string $referencedTable, string $referencedColumn): bool
    {
        $databaseName = DB::getDatabaseName();

        if (! $databaseName) {
            return false;
        }

        return DB::table('information_schema.KEY_COLUMN_USAGE')
            ->where('TABLE_SCHEMA', $databaseName)
            ->where('TABLE_NAME', $tableName)
            ->where('COLUMN_NAME', $column)
            ->where('REFERENCED_TABLE_NAME', $referencedTable)
            ->where('REFERENCED_COLUMN_NAME', $referencedColumn)
            ->exists();
    }
};
