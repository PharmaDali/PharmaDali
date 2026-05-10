<?php

namespace App\Services\Forecast;

use App\Models\Forecast;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ForecastSyncService
{
    public function syncAll(): array
    {
        $summary = [];

        foreach (['sales', 'demand'] as $kind) {
            foreach (['weekly', 'monthly'] as $granularity) {
                $payload = $this->fetchForecast($kind, $granularity);
                $count = $this->storePayload($payload, $kind, $granularity);
                $summary[] = [
                    'kind' => $kind,
                    'granularity' => $granularity,
                    'rows' => $count,
                ];
            }
        }

        return $summary;
    }

    private function fetchForecast(string $kind, string $granularity): array
    {
        $baseUrl = config('services.fastapi.base_url');
        $topN = config('services.fastapi.top_n');
        $timeoutSeconds = config('services.fastapi.timeout', 30);

        $response = Http::baseUrl($baseUrl)
            ->timeout($timeoutSeconds)
            ->get("/forecast/{$kind}", [
                'granularity' => $granularity,
                'top_n' => $topN,
            ]);

        $response->throw();

        return $response->json();
    }

    private function storePayload(array $payload, string $kind, string $granularity): int
    {
        $rows = [];

        foreach (['current', 'next'] as $period) {
            $periodRows = Arr::get($payload, $period, []);
            if (empty($periodRows)) {
                continue;
            }

            [$periodStart, $periodEnd] = $this->resolvePeriodRange(
                $payload,
                $period,
                $granularity
            );

            foreach ($periodRows as $row) {
                $modelName = $this->extractModelName($row);
                $forecastValue = $modelName ? $row[$modelName] : null;
                $tenantId = $this->extractTenantId($row);

                if ($forecastValue === null) {
                    continue;
                }

                $rows[] = [
                    'kind' => $kind,
                    'granularity' => $granularity,
                    'period' => $period,
                    'period_start' => $periodStart,
                    'period_end' => $periodEnd,
                    'ds' => Carbon::parse($row['ds'])->toDateString(),
                    'tenant_id' => $tenantId,
                    'unique_id' => (string) $row['unique_id'],
                    'model_name' => $modelName,
                    'forecast_value' => $forecastValue,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (empty($rows)) {
            return 0;
        }

        DB::transaction(function () use ($rows) {
            Forecast::upsert(
                $rows,
                ['kind', 'granularity', 'period', 'ds', 'unique_id'],
                ['period_start', 'period_end', 'model_name', 'forecast_value', 'updated_at']
            );
        });

        return count($rows);
    }

    private function resolvePeriodRange(array $payload, string $period, string $granularity): array
    {
        if ($granularity === 'weekly') {
            $startKey = $period === 'current' ? 'current_week_start' : 'next_week_start';
            $endKey = $period === 'current' ? 'current_week_end' : 'next_week_end';

            $start = Arr::get($payload, $startKey);
            $end = Arr::get($payload, $endKey);

            if ($start && $end) {
                return [$start, $end];
            }
        }

        $anchorKey = $period === 'current' ? 'current_week' : 'next_week';
        $anchor = Carbon::parse(Arr::get($payload, $anchorKey));

        if ($granularity === 'monthly') {
            return [$anchor->copy()->startOfMonth()->toDateString(), $anchor->copy()->endOfMonth()->toDateString()];
        }

        $start = $anchor->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
        $end = $anchor->copy()->endOfWeek(Carbon::SUNDAY)->toDateString();

        return [$start, $end];
    }

    private function extractModelName(array $row): ?string
    {
        foreach ($row as $key => $value) {
            if (in_array($key, ['unique_id', 'tenant_id', 'ds'], true)) {
                continue;
            }
            return $key;
        }

        return null;
    }

    private function extractTenantId(array $row): ?int
    {
        $tenantId = $row['tenant_id'] ?? $row['unique_id'] ?? null;

        if ($tenantId === null) {
            return null;
        }

        return is_numeric($tenantId) ? (int) $tenantId : null;
    }
}
