<?php

namespace App\Services\Forecast;

use App\Models\ForecastInsight;
use App\Models\Forecast;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class ForecastInsightService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;
    private int $timeout;
    private int $cacheTtlMinutes;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key');
        $this->model = (string) config('services.gemini.model');
        $this->baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
        $this->timeout = (int) config('services.gemini.timeout', 20);
        $this->cacheTtlMinutes = (int) config('services.gemini.cache_ttl_minutes', 30);
    }

    public function generate(User $user, string $demandGranularity, string $salesGranularity): array
    {
        if (!$user->pharmacy_id) {
            return [
                'demand' => 'No pharmacy data available yet.',
                'sales' => 'No pharmacy data available yet.',
            ];
        }

        if (!$this->apiKey) {
            return [
                'demand' => 'Gemini API key is not configured yet.',
                'sales' => 'Gemini API key is not configured yet.',
            ];
        }

        $demand = $this->loadDemandData($user->pharmacy_id, $demandGranularity);
        $sales = $this->loadSalesData($user->pharmacy_id, $salesGranularity);
        $weekStart = Carbon::now()->startOfWeek(CarbonInterface::MONDAY)->toDateString();
        $sourceHash = $this->buildSourceHash($demand, $sales, $demandGranularity, $salesGranularity);

        // Return cached DB record if data hasn't changed
        $existing = ForecastInsight::query()
            ->where('week_start', $weekStart)
            ->where('demand_granularity', $demandGranularity)
            ->where('sales_granularity', $salesGranularity)
            ->where('model', $this->model)
            ->first();

        if ($existing && $existing->source_hash === $sourceHash) {
            return [
                'demand' => $existing->demand,
                'sales' => $existing->sales,
            ];
        }

        // Return in-memory cache if available
        $cacheKey = $this->getCacheKey(
            $user->pharmacy_id,
            $weekStart,
            $demandGranularity,
            $salesGranularity,
            $this->model,
            $sourceHash
        );

        try {
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && isset($cached['demand'], $cached['sales'])) {
                return $cached;
            }
        } catch (Throwable) {
            // Continue without cache when Redis is unavailable.
        }

        // Call Gemini with two focused plain-text prompts
        $insights = ['demand', 'sales'];
        $insights['demand'] = $this->callGemini($this->buildDemandPrompt($demand, $demandGranularity));
        sleep(35);
        $insights['sales'] = $this->callGemini($this->buildSalesPrompt($sales, $salesGranularity));


        ForecastInsight::updateOrCreate(
            [
                'pharmacy_id'         => $user->pharmacy_id,
                'week_start'          => $weekStart,
                'demand_granularity'  => $demandGranularity,
                'sales_granularity'   => $salesGranularity,
                'model'               => $this->model,
            ],
            [
                'demand'      => $insights['demand'],
                'sales'       => $insights['sales'],
                'source_hash' => $sourceHash,
            ]
        );

        try {
            Cache::put($cacheKey, $insights, now()->addMinutes($this->cacheTtlMinutes));
        } catch (Throwable) {
            // Continue without cache when Redis is unavailable.
        }

        return $insights;
    }

    private function callGemini(string $prompt): string
    {
        logger()->info('Gemini request starting');

        $response = Http::timeout($this->timeout)
            ->post("{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 1024,
                ],
            ]);

        logger()->info('Gemini response received', ['status' => $response->status()]);

        if (!$response->successful()) {
            return 'Unable to generate insight at the moment.';
        }

        $text = trim(data_get($response->json(), 'candidates.0.content.parts.0.text', ''));

        return $text ?: 'No insight available.';
    }

    private function buildDemandPrompt(array $demand, string $granularity): string
    {
        $current = $this->formatDemandRows($demand['current'] ?? []);
        $next = $this->formatDemandRows($demand['next'] ?? []);

        return "You are a retail demand analyst. Write 2-3 sentences of plain text insight. No JSON, no bullets.\n\n"
            . "Granularity: {$granularity}\n"
            . "Top demand this period: {$current}\n"
            . "Top demand next period: {$next}\n\n"
            . "Highlight top movers and any notable shift between periods.";
    }

    private function buildSalesPrompt(array $sales, string $granularity): string
    {
        $history = $this->formatSalesRows($sales['history'] ?? []);
        $current = $this->formatSalesSingle($sales['current'] ?? null);
        $next = $this->formatSalesSingle($sales['next'] ?? null);

        return <<<PROMPT
        You are a retail sales analyst. Write a single concise insight (1-2 sentences, plain text, no bullet points, no JSON) about the sales forecast below.

        Granularity: {$granularity}
        Recent sales history: {$history}
        Current period sales: {$current}
        Next period forecast: {$next}

        Focus on the sales trend, growth or decline, and what to watch out for.
        PROMPT;
    }

    private function loadDemandData(int $pharmacyId, string $granularity): array
    {
        $baseQuery = Forecast::query()
            ->where('kind', 'demand')
            ->where('granularity', $granularity);

        $current = (clone $baseQuery)
            ->where('period', 'current')
            ->orderByDesc('forecast_value')
            ->limit(3)  // top 3 movers for current period
            ->get(['unique_id', 'forecast_value'])
            ->toArray();

        $next = (clone $baseQuery)
            ->where('period', 'next')
            ->orderByDesc('forecast_value')
            ->limit(3)
            ->get(['unique_id', 'forecast_value'])
            ->toArray();

        return [
            'current' => $current,
            'next' => $next,
        ];
    }

    private function loadSalesData(int $pharmacyId, string $granularity): array
    {
        $baseQuery = Forecast::query()
            ->where('kind', 'sales')
            ->where('granularity', $granularity);

        $history = (clone $baseQuery)
            ->where('period', 'history')
            ->orderByDesc('ds')
            ->limit(5)
            ->get(['forecast_value', 'ds'])
            ->reverse()
            ->values()
            ->toArray();

        $current = (clone $baseQuery)
            ->where('period', 'current')
            ->orderByDesc('ds')
            ->limit(1)
            ->get(['forecast_value', 'ds'])
            ->first();

        $next = (clone $baseQuery)
            ->where('period', 'next')
            ->orderByDesc('ds')
            ->limit(1)
            ->get(['forecast_value', 'ds'])
            ->first();

        return [
            'history' => $history,
            'current' => $current?->toArray(),
            'next' => $next?->toArray(),
        ];
    }

    private function formatDemandRows(array $rows): string
    {
        if (empty($rows)) {
            return 'none';
        }

        return implode('; ', array_map(function ($row) {
            $name = $row['unique_id'] ?? 'Unknown';
            $value = $row['forecast_value'] !== null ? number_format((float) $row['forecast_value'], 0) : 'n/a';
            return "{$name} ({$value})";
        }, $rows));
    }

    private function formatSalesRows(array $rows): string
    {
        if (empty($rows)) {
            return 'none';
        }

        return implode(', ', array_map(function ($row) {
            $value = $row['forecast_value'] !== null ? number_format((float) $row['forecast_value'], 0) : 'n/a';
            $date = $row['ds'] ?? null;
            return "{$value} on {$date}";
        }, $rows));
    }

    private function formatSalesSingle(?array $row): string
    {
        if (!$row) {
            return 'none';
        }

        $value = $row['forecast_value'] !== null ? number_format((float) $row['forecast_value'], 0) : 'n/a';
        $date = $row['ds'] ?? null;
        return "{$value} on {$date}";
    }

    private function buildSourceHash(array $demand, array $sales, string $demandGranularity, string $salesGranularity): string
    {
        $payload = [
            'demand_granularity' => $demandGranularity,
            'sales_granularity' => $salesGranularity,
            'demand' => $demand,
            'sales' => $sales,
        ];

        $encoded = json_encode($payload, JSON_UNESCAPED_SLASHES) ?: serialize($payload);

        return hash('sha256', $encoded);
    }

    private function getCacheKey(
        int $tenantId,
        string $weekStart,
        string $demandGranularity,
        string $salesGranularity,
        string $model,
        string $sourceHash
    ): string {
        return sprintf(
            'forecast_insight:%d:%s:%s:%s:%s:%s',
            $tenantId,
            $weekStart,
            $demandGranularity,
            $salesGranularity,
            $model,
            $sourceHash
        );
    }
}