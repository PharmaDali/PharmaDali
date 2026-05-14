<?php

namespace App\Jobs;

use App\Models\ForecastInsight;
use App\Services\Forecast\ForecastInsightService;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateForecastInsightJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120; 
    public int $tries   = 1;

    public function __construct(
        public readonly User   $user,
        public readonly string $demandGranularity,
        public readonly string $salesGranularity,
    ) {}

    public function handle(ForecastInsightService $service): void
    {
        $service->generate($this->user, $this->demandGranularity, $this->salesGranularity);
    }
}