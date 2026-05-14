<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forecast_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->date('week_start');
            $table->string('demand_granularity', 50);
            $table->string('sales_granularity', 50);
            $table->string('model', 100);
            $table->text('demand');
            $table->text('sales');
            $table->char('source_hash', 64);
            $table->timestamps();

            $table->unique(
                ['tenant_id', 'week_start', 'demand_granularity', 'sales_granularity', 'model'],
                'forecast_insights_unique_key'
            );
            $table->index(['tenant_id']);
            $table->index(['week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forecast_insights');
    }
};
