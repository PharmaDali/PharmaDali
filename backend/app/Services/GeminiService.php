<?php

namespace App\Services;

use App\Repositories\AnalyticsRepository;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    public function __construct(protected AnalyticsRepository $repository)
    {
    }

    /**
     * Get AI Insights from Gemini API for demand or sales data.
     */
    public function getAnalyticsInsights(int $pharmacyId, string $type = 'demand'): array
    {
        $cacheKey = "pharmacy_{$pharmacyId}_gemini_insight_{$type}";
        $ttl = config('services.gemini.cache_ttl_minutes', 30);

        return Cache::remember($cacheKey, now()->addMinutes($ttl), function () use ($pharmacyId, $type) {
            return $this->generateInsight($pharmacyId, $type);
        });
    }

    private function generateInsight(int $pharmacyId, string $type): array
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-2.5-flash');
        $baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');

        $fallbackText = $type === 'demand'
            ? "Demand for common OTC and maintenance medications typically peaks on weekends. Use the top demand chart to allocate stock appropriately."
            : "Sales revenue tends to align with high foot traffic periods. Monitor top sales products to optimize your primary inventory investments.";

        if (!$apiKey) {
            return [
                'insight' => $fallbackText,
                'source' => 'fallback',
            ];
        }

        try {
            // Gather contextual analytics summary
            if ($type === 'demand') {
                $topDemand = $this->repository->getDemand($pharmacyId, now()->subDays(30)->toDateString(), now()->toDateString(), 5);
                $summary = collect($topDemand)->map(fn($item) => "{$item->product_name}: {$item->total_quantity_sold} units")->implode(', ');
                $prompt = "You are a professional pharmacy inventory management AI. Based on the 30-day top demand product sales data for this pharmacy ({$summary}), write a concise 1-2 sentence executive recommendation on stock replenishment and inventory optimization. Do not use bullet points or markdown.";
            } else {
                $topSales = $this->repository->getDemand($pharmacyId, now()->subDays(30)->toDateString(), now()->toDateString(), 5);
                $summary = collect($topSales)->map(fn($item) => "{$item->product_name}: PHP " . number_format($item->total_revenue, 2))->implode(', ');
                $prompt = "You are a professional pharmacy financial analytics AI. Based on the 30-day revenue product performance data ({$summary}), write a concise 1-2 sentence executive recommendation for maximizing pharmacy sales revenue. Do not use bullet points or markdown.";
            }

            $endpoint = "{$baseUrl}/models/{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(config('services.gemini.timeout', 15))
                ->post($endpoint, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $generatedText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($generatedText) {
                    return [
                        'insight' => trim($generatedText),
                        'source' => 'gemini',
                    ];
                }
            } else {
                Log::warning('Gemini API call failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Gemini Service Exception: ' . $e->getMessage());
        }

        return [
            'insight' => $fallbackText,
            'source' => 'fallback',
        ];
    }
}
