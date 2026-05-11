<?php

namespace App\Services\Forecast;

use App\Models\Forecast;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class ForecastInsightService
{
    public function generate(User $user, string $demandGranularity, string $salesGranularity): array
    {
        if (!$user->branch_id) {
            return [
                'demand' => 'No branch data available yet.',
                'sales' => 'No branch data available yet.',
            ];
        }

        $demand = $this->loadDemandData($user->branch_id, $demandGranularity);
        $sales = $this->loadSalesData($user->branch_id, $salesGranularity);

        $prompt = $this->buildPrompt($demand, $sales, $demandGranularity, $salesGranularity);

        $apiKey = config('services.gemini.api_key');
        if (!$apiKey) {
            return [
                'demand' => 'Gemini API key is not configured yet.',
                'sales' => 'Gemini API key is not configured yet.',
            ];
        }

        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
        $model = config('services.gemini.model');
        $timeout = config('services.gemini.timeout', 20);

        $response = Http::timeout($timeout)
            ->post("{$baseUrl}/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 200,
                ],
            ]);

        if (!$response->successful()) {
            return [
                'demand' => 'Unable to generate demand insight at the moment.',
                'sales' => 'Unable to generate sales insight at the moment.',
            ];
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
        $parsed = $this->parseJsonResponse($text);

        return [
            'demand' => $parsed['demand'] ?? 'No demand insight available.',
            'sales' => $parsed['sales'] ?? 'No sales insight available.',
        ];
    }

    private function loadDemandData(int $tenantId, string $granularity): array
    {
        $baseQuery = Forecast::query()
            ->where('tenant_id', $tenantId)
            ->where('kind', 'demand')
            ->where('granularity', $granularity);

        $current = (clone $baseQuery)
            ->where('period', 'current')
            ->orderByDesc('forecast_value')
            ->limit(5)
            ->get(['unique_id', 'forecast_value', 'ds'])
            ->toArray();

        $next = (clone $baseQuery)
            ->where('period', 'next')
            ->orderByDesc('forecast_value')
            ->limit(5)
            ->get(['unique_id', 'forecast_value', 'ds'])
            ->toArray();

        return [
            'current' => $current,
            'next' => $next,
        ];
    }

    private function loadSalesData(int $tenantId, string $granularity): array
    {
        $baseQuery = Forecast::query()
            ->where('tenant_id', $tenantId)
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
            'current' => $current ? $current->toArray() : null,
            'next' => $next ? $next->toArray() : null,
        ];
    }

    private function buildPrompt(array $demand, array $sales, string $demandGranularity, string $salesGranularity): string
    {
        $demandCurrent = $this->formatDemandRows($demand['current'] ?? []);
        $demandNext = $this->formatDemandRows($demand['next'] ?? []);
        $salesHistory = $this->formatSalesRows($sales['history'] ?? []);
        $salesCurrent = $this->formatSalesSingle($sales['current'] ?? null);
        $salesNext = $this->formatSalesSingle($sales['next'] ?? null);

        $template = config('services.gemini.insight_prompt');
        $replacements = [
            '{demand_granularity}' => $demandGranularity,
            '{sales_granularity}' => $salesGranularity,
            '{demand_current}' => $demandCurrent,
            '{demand_next}' => $demandNext,
            '{sales_history}' => $salesHistory,
            '{sales_current}' => $salesCurrent,
            '{sales_next}' => $salesNext,
        ];

        return strtr((string) $template, $replacements);
    }

    private function formatDemandRows(array $rows): string
    {
        if (empty($rows)) {
            return 'none';
        }

        $parts = array_map(function ($row) {
            $name = $row['unique_id'] ?? 'Unknown';
            $value = $row['forecast_value'] ?? null;
            $date = $row['ds'] ?? null;
            $valueText = $value !== null ? number_format((float) $value, 0) : 'n/a';
            return "{$name} ({$valueText} on {$date})";
        }, $rows);

        return implode('; ', $parts);
    }

    private function formatSalesRows(array $rows): string
    {
        if (empty($rows)) {
            return 'none';
        }

        $parts = array_map(function ($row) {
            $value = $row['forecast_value'] ?? null;
            $date = $row['ds'] ?? null;
            $valueText = $value !== null ? number_format((float) $value, 0) : 'n/a';
            return "{$valueText} on {$date}";
        }, $rows);

        return implode(', ', $parts);
    }

    private function formatSalesSingle(?array $row): string
    {
        if (!$row) {
            return 'none';
        }

        $value = $row['forecast_value'] ?? null;
        $date = $row['ds'] ?? null;
        $valueText = $value !== null ? number_format((float) $value, 0) : 'n/a';
        return "{$valueText} on {$date}";
    }

    private function parseJsonResponse(?string $text): array
    {
        if (!$text) {
            return [];
        }

        $clean = trim($text);
        $clean = preg_replace('/^```json/i', '', $clean);
        $clean = preg_replace('/```$/', '', $clean);
        $clean = trim($clean);

        $decoded = json_decode($clean, true);
        if (is_array($decoded)) {
            return $this->sanitizeParsed($decoded);
        }

        if (preg_match('/\{.*\}/s', $clean, $match)) {
            $decoded = json_decode($match[0], true);
            if (is_array($decoded)) {
                return $this->sanitizeParsed($decoded);
            }
        }

        $demand = null;
        $sales = null;

        if (preg_match('/demand\s*:\s*(.+)/i', $clean, $match)) {
            $demand = trim($match[1]);
        }

        if (preg_match('/sales\s*:\s*(.+)/i', $clean, $match)) {
            $sales = trim($match[1]);
        }

        if ($demand || $sales) {
            return $this->sanitizeParsed(array_filter([
                'demand' => $demand,
                'sales' => $sales,
            ], fn ($value) => $value !== null));
        }

        return [
            'demand' => $clean,
            'sales' => $clean,
        ];
    }

    private function sanitizeParsed(array $parsed): array
    {
        $result = [];

        foreach (['demand', 'sales'] as $key) {
            $value = $parsed[$key] ?? null;
            if (!is_string($value)) {
                continue;
            }

            $normalized = strtolower(trim($value));
            if ($normalized === '' || str_contains($normalized, 'here is the json requested')) {
                continue;
            }

            $result[$key] = $value;
        }

        return $result;
    }
}
