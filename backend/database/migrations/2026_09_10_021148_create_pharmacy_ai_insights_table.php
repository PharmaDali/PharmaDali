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
        Schema::create('pharmacy_ai_insights', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pharmacy_id');
            $table->string('type');        // 'demand' | 'sales'
            $table->string('timeframe');   // 'daily' | 'weekly' | 'monthly'
            $table->text('insight');
            $table->string('source')->default('gemini'); // 'gemini' | 'fallback'
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->foreign('pharmacy_id')
                  ->references('id')
                  ->on('pharmacies')
                  ->cascadeOnDelete();

            // One live row per pharmacy × type × timeframe combination
            $table->unique(['pharmacy_id', 'type', 'timeframe']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_ai_insights');
    }
};
