<?php

namespace App\Console\Commands;

use App\Services\Forecast\ForecastSyncService;
use Illuminate\Console\Command;

class SyncForecasts extends Command
{
    protected $signature = 'forecast:sync';
    protected $description = 'Fetch forecasts from FastAPI and store them in the database.';

    public function handle(ForecastSyncService $service): int
    {
        $summary = $service->syncAll();

        $this->info('Forecast sync completed.');
        foreach ($summary as $item) {
            $this->line(sprintf(
                '%s %s: %d rows',
                ucfirst($item['kind']),
                $item['granularity'],
                $item['rows']
            ));
        }

        return self::SUCCESS;
    }
}
