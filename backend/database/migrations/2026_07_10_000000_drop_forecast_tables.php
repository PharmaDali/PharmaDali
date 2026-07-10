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
        Schema::dropIfExists('forecast_insights');
        Schema::dropIfExists('forecasts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('forecasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->cascadeOnDelete();
            $table->string('kind', 32);
            $table->string('granularity', 16);
            $table->string('period', 16);
            $table->date('ds');
            $table->string('unique_id')->nullable();
            $table->string('model_name', 64)->nullable();
            $table->decimal('forecast_value', 15, 4);
            $table->timestamps();
            
            $table->unique(['kind', 'granularity', 'period', 'ds', 'unique_id'], 'forecasts_unique_key');
        });

        Schema::create('forecast_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->cascadeOnDelete();
            $table->string('kind', 32);
            $table->string('granularity', 16);
            $table->string('period', 16);
            $table->string('insight_type', 32);
            $table->text('insight_text');
            $table->timestamps();

            $table->unique(
                ['pharmacy_id', 'kind', 'granularity', 'period', 'insight_type'],
                'forecast_insights_unique_key'
            );
        });
    }
};
