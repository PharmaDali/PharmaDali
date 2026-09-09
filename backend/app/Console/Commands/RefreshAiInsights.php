<?php

namespace App\Console\Commands;

use App\Models\Pharmacy;
use App\Services\Analytics\GetAnalyticsInsights;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RefreshAiInsights extends Command
{
    protected $signature = 'analytics:refresh-insights';

    protected $description = 'Generate and persist Gemini AI analytics insights for all active pharmacies and all type/timeframe combinations.';

    /**
     * The insight type and timeframe combinations to generate per pharmacy.
     */
    private const COMBINATIONS = [
        ['type' => 'demand', 'timeframe' => 'daily'],
        ['type' => 'demand', 'timeframe' => 'weekly'],
        ['type' => 'demand', 'timeframe' => 'monthly'],
        ['type' => 'sales',  'timeframe' => 'daily'],
        ['type' => 'sales',  'timeframe' => 'weekly'],
        ['type' => 'sales',  'timeframe' => 'monthly'],
    ];

    public function handle(GetAnalyticsInsights $insightService): int
    {
        // Prevent overlapping executions (1200 second TTL to accommodate free-tier pacing).
        $lock = Cache::lock('analytics:refresh-insights', 1200);

        if (!$lock->get()) {
            $this->info('Insight refresh is already running. Skipping.');
            return self::SUCCESS;
        }

        try {
            $pharmacies = Pharmacy::where('is_active', true)->get();

            if ($pharmacies->isEmpty()) {
                $this->info('No active pharmacies found. Nothing to refresh.');
                return self::SUCCESS;
            }

            $this->info("Refreshing AI insights for {$pharmacies->count()} active pharmacies...");

            foreach ($pharmacies as $pharmacy) {
                foreach (self::COMBINATIONS as $combo) {
                    try {
                        $result = $insightService->handle($pharmacy->id, $combo['type'], $combo['timeframe']);

                        Log::info("RefreshAiInsights: processed insight", [
                            'pharmacy_id' => $pharmacy->id,
                            'type'        => $combo['type'],
                            'timeframe'   => $combo['timeframe'],
                            'source'      => $result['source'] ?? 'unknown',
                        ]);

                        $this->line("  Pharmacy #{$pharmacy->id} [{$combo['type']}/{$combo['timeframe']}]: " . ($result['source'] ?? 'done'));

                        // Throttle requests by 13s to stay safely below Gemini Free Tier 5 RPM rate limit
                        sleep(13);
                    } catch (\Throwable $e) {
                        Log::error("RefreshAiInsights: failed for pharmacy {$pharmacy->id} [{$combo['type']}/{$combo['timeframe']}]: " . $e->getMessage());
                    }
                }

                $this->line("  Pharmacy #{$pharmacy->id} ({$pharmacy->name}) all combinations completed.");
            }

            $this->info('AI insights refresh completed.');
            return self::SUCCESS;
        } finally {
            $lock->release();
        }
    }
}
