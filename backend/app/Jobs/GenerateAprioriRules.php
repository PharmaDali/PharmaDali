<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use App\Services\AprioriService;

class GenerateAprioriRules implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $pharmacyId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AprioriService $aprioriService): void
    {
        $pharmacyId = $this->pharmacyId;

        // Generate and Cache Product Rules
        $productRulesKey = "apriori_rules_pharmacy_{$pharmacyId}";
        $productRulesData = $aprioriService->generateFrequentlyBoughtTogether($pharmacyId, 6, 0.05, 0.2);
        Cache::put($productRulesKey, $productRulesData, 60 * 60 * 24);

        // Generate and Cache Category Rules
        $categoryRulesKey = "apriori_category_rules_pharmacy_{$pharmacyId}";
        $categoryRulesData = $aprioriService->generateCategoryRules($pharmacyId, 6, 0.05, 0.2);
        Cache::put($categoryRulesKey, $categoryRulesData, 60 * 60 * 24);
    }
}
