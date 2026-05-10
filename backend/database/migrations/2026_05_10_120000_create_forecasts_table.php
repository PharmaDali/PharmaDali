<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forecasts', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 50);
            $table->string('granularity', 50);
            $table->string('period', 50);
            $table->date('period_start');
            $table->date('period_end');
            $table->date('ds');
            $table->foreignId('tenant_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('unique_id', 100);
            $table->string('model_name', 100)->nullable();
            $table->decimal('forecast_value', 15, 4);
            $table->timestamps();

            $table->unique(['kind', 'granularity', 'period', 'ds', 'unique_id'], 'forecasts_unique_key');
            $table->index(['kind', 'granularity', 'period']);
            $table->index(['tenant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forecasts');
    }
};
