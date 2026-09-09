<?php

namespace App\Services\Analytics;

use App\Models\PharmacyAiInsight;
use App\Repositories\AnalyticsRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GetAnalyticsInsights
{
    public function __construct(protected AnalyticsRepository $repository)
    {
    }

    /**
     * Return the Gemini AI insight for the given pharmacy, type, and timeframe.
     * Reads from the database first. Only calls the Gemini API when no fresh
     * record exists for today (Philippine Standard Time, UTC+8).
     */
    public function handle(int $pharmacyId, string $type = 'demand', string $timeframe = 'daily', bool $force = false): array
    {
        $today = Carbon::now('Asia/Manila')->toDateString();

        $existing = PharmacyAiInsight::where('pharmacy_id', $pharmacyId)
            ->where('type', $type)
            ->where('timeframe', $timeframe)
            ->first();

        // Return the stored record if it was generated today with gemini.
        if (
            !$force &&
            $existing &&
            $existing->source === 'gemini' &&
            $existing->generated_at &&
            $existing->generated_at->timezone('Asia/Manila')->toDateString() === $today
        ) {
            return [
                'insight'      => $existing->insight,
                'source'       => $existing->source,
                'timeframe'    => $existing->timeframe,
                'generated_at' => $existing->generated_at->timezone('Asia/Manila')->toIso8601String(),
            ];
        }

        // Generate a new insight via Gemini
        $result = $this->generateInsight($pharmacyId, $type, $timeframe);
        $generatedAt = Carbon::now('Asia/Manila');

        if ($result['source'] === 'gemini') {
            $record = PharmacyAiInsight::updateOrCreate(
                [
                    'pharmacy_id' => $pharmacyId,
                    'type'        => $type,
                    'timeframe'   => $timeframe,
                ],
                [
                    'insight'      => $result['insight'],
                    'source'       => 'gemini',
                    'generated_at' => $generatedAt,
                ]
            );

            return [
                'insight'      => $record->insight,
                'source'       => $record->source,
                'timeframe'    => $record->timeframe,
                'generated_at' => $record->generated_at->timezone('Asia/Manila')->toIso8601String(),
            ];
        }

        // If Gemini failed, protect previous good Gemini insight from being overwritten with fallback
        if ($existing && $existing->source === 'gemini') {
            return [
                'insight'      => $existing->insight,
                'source'       => $existing->source,
                'timeframe'    => $existing->timeframe,
                'generated_at' => $existing->generated_at ? $existing->generated_at->timezone('Asia/Manila')->toIso8601String() : null,
            ];
        }

        // If no prior record existed at all, store the fallback
        if (!$existing) {
            $record = PharmacyAiInsight::updateOrCreate(
                [
                    'pharmacy_id' => $pharmacyId,
                    'type'        => $type,
                    'timeframe'   => $timeframe,
                ],
                [
                    'insight'      => $result['insight'],
                    'source'       => 'fallback',
                    'generated_at' => $generatedAt,
                ]
            );

            return [
                'insight'      => $record->insight,
                'source'       => $record->source,
                'timeframe'    => $record->timeframe,
                'generated_at' => $record->generated_at->timezone('Asia/Manila')->toIso8601String(),
            ];
        }

        return [
            'insight'      => $result['insight'],
            'source'       => $result['source'],
            'timeframe'    => $timeframe,
            'generated_at' => $generatedAt->toIso8601String(),
        ];
    }

    /**
     * Call the Gemini API with a timeframe-aware prompt and return the result.
     * Includes automatic retry with backoff on HTTP 429 (Rate Limit).
     */
    private function generateInsight(int $pharmacyId, string $type, string $timeframe): array
    {
        $apiKey  = config('services.gemini.api_key');
        $model   = config('services.gemini.model', 'gemini-2.5-flash');
        $baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');

        $fallbackText = $type === 'demand'
            ? 'Demand for common OTC and maintenance medications typically peaks on weekends. Use the top demand chart to allocate stock appropriately.'
            : 'Sales revenue tends to align with high foot traffic periods. Monitor top sales products to optimize your primary inventory investments.';

        if (!$apiKey) {
            return ['insight' => $fallbackText, 'source' => 'fallback'];
        }

        // Resolve the lookback date range from timeframe (Philippine time).
        [$startDate, $endDate] = $this->resolveDateRange($timeframe);

        $timeframeLabel = match ($timeframe) {
            'daily'   => 'last 7 days',
            'weekly'  => 'last 4 weeks',
            'monthly' => 'last 3 months',
            default   => 'recent period',
        };

        try {
            if ($type === 'demand') {
                $topData = $this->repository->getDemand($pharmacyId, $startDate, $endDate, 5);
                $summary = collect($topData)
                    ->map(fn ($item) => "{$item->product_name}: {$item->total_quantity_sold} units")
                    ->implode(', ');
                $prompt = "You are a professional pharmacy inventory management AI. Based on the {$timeframeLabel} top demand product sales data for this pharmacy ({$summary}), write a concise 1-2 sentence executive recommendation on stock replenishment and inventory optimization. Do not use bullet points or markdown.";
            } else {
                $topData = $this->repository->getDemand($pharmacyId, $startDate, $endDate, 5);
                $summary = collect($topData)
                    ->map(fn ($item) => "{$item->product_name}: PHP " . number_format($item->total_revenue, 2))
                    ->implode(', ');
                $prompt = "You are a professional pharmacy financial analytics AI. Based on the {$timeframeLabel} revenue product performance data ({$summary}), write a concise 1-2 sentence executive recommendation for maximizing pharmacy sales revenue. Do not use bullet points or markdown.";
            }

            $endpoint = "{$baseUrl}/models/{$model}:generateContent?key={$apiKey}";
            $maxAttempts = 3;

            for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                $response = Http::timeout(config('services.gemini.timeout', 20))
                    ->post($endpoint, [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                ],
                            ],
                        ],
                    ]);

                if ($response->successful()) {
                    $generatedText = $response->json('candidates.0.content.parts.0.text');

                    if ($generatedText) {
                        return [
                            'insight' => trim($generatedText),
                            'source'  => 'gemini',
                        ];
                    }
                }

                if ($response->status() === 429 && $attempt < $maxAttempts) {
                    $retryDelay = 5;
                    $details = $response->json('error.details', []);
                    foreach ($details as $detail) {
                        if (isset($detail['retryDelay'])) {
                            $retryDelay = max((int) filter_var($detail['retryDelay'], FILTER_SANITIZE_NUMBER_INT), 3);
                            break;
                        }
                    }
                    Log::info("Gemini API rate limited (429). Retrying in {$retryDelay}s (attempt {$attempt}/{$maxAttempts})...");
                    sleep($retryDelay);
                    continue;
                }

                Log::warning('Gemini API call failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                break;
            }
        } catch (\Throwable $e) {
            Log::error('Gemini Service Exception: ' . $e->getMessage());
        }

        return ['insight' => $fallbackText, 'source' => 'fallback'];
    }

    /**
     * Return [startDate, endDate] strings in Philippine time for the given timeframe.
     */
    private function resolveDateRange(string $timeframe): array
    {
        $now = Carbon::now('Asia/Manila');

        $start = match ($timeframe) {
            'daily'              => $now->copy()->subDays(7),
            'weekly'             => $now->copy()->subDays(28),
            'monthly'            => $now->copy()->subDays(90),
            'yearly', 'annually' => $now->copy()->subYear(),
            default              => $now->copy()->subDays(30),
        };

        return [$start->toDateString(), $now->toDateString()];
    }
}
