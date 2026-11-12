<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Models\Products;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ScrapeMedsGoProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'staging:scrape-medsgo 
                            {--pharmacy_id= : Target Pharmacy ID (default: first active pharmacy)}
                            {--limit=50 : Total number of products to scrape}
                            {--category= : Optional filter: rx, otc, or slug keyword (e.g. antibiotics, respiratory, eye, vitamins, diabetes)}
                            {--stock=100 : Initial inventory stock per product for staging}
                            {--fresh : Remove previously scraped MedsGo products before importing}
                            {--skip-images : Skip downloading images}
                            {--dry-run : Preview scraped data without saving to database}
                            {--sanitize-existing : Sanitize description, dosage/strength, and size for all existing products in database}
                            {--sanitize-only : Only sanitize existing products in database without scraping new items}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape realistic product catalog and images from medsgo.ph for staging environment';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $pharmacyIdOption = $this->option('pharmacy_id');
        $limit = max(1, (int) $this->option('limit'));
        $categoryFilter = strtolower(trim((string) $this->option('category')));
        $defaultStock = max(1, (int) $this->option('stock'));
        $dryRun = (bool) $this->option('dry-run');
        $skipImages = (bool) $this->option('skip-images');
        $fresh = (bool) $this->option('fresh');

        // Resolve Target Pharmacies
        $targetPharmacies = $pharmacyIdOption 
            ? Pharmacy::where('id', $pharmacyIdOption)->get() 
            : Pharmacy::where('is_active', true)->get();

        if ($targetPharmacies->isEmpty()) {
            $targetPharmacies = Pharmacy::all();
        }

        if ($targetPharmacies->isEmpty()) {
            $this->error('No pharmacies found in database. Please run migrations and seeders first.');
            return Command::FAILURE;
        }

        $pharmacyNames = $targetPharmacies->pluck('pharmacy_name')->implode(', ');

        $this->info('========================================================================');
        $this->info("Target Pharmacies: {$pharmacyNames} (" . $targetPharmacies->count() . " branches)");
        $this->info("Target Limit:      {$limit} products");
        $this->info("Stock per Item:    {$defaultStock} units per branch");
        $this->info("Category Filter:   " . ($categoryFilter ?: 'All / Balanced Selection'));
        $this->info("Download Images:   " . ($skipImages ? 'No' : 'Yes (storage/app/public/products)'));
        $this->info($dryRun ? 'MODE: [DRY-RUN] (No database changes)' : 'MODE: [LIVE IMPORT]');
        $this->info('========================================================================');

        if ($fresh && !$dryRun) {
            $this->warn("Clearing previously scraped MedsGo products across all target pharmacies...");
            $pharmacyIds = $targetPharmacies->pluck('id')->toArray();
            $scrapedBatches = ProductBatch::where(function ($q) {
                    $q->where('batch_number', 'LIKE', 'MEDSGO-%')
                      ->orWhere('batch_number', 'LIKE', 'STAGING-%');
                })
                ->whereHas('pharmacyProduct', fn($q) => $q->whereIn('pharmacy_id', $pharmacyIds))
                ->get();

            foreach ($scrapedBatches as $batch) {
                $pp = $batch->pharmacyProduct;
                $batch->delete();
                if ($pp) {
                    $prod = $pp->product;
                    $pp->delete();
                    if ($prod && in_array($prod->pharmacy_id, $pharmacyIds, true)) {
                        if ($prod->image_path && Storage::disk('public')->exists($prod->image_path)) {
                            Storage::disk('public')->delete($prod->image_path);
                        }
                        $prod->delete();
                    }
                }
            }
            $this->info('Previous MedsGo staging products cleaned.');
        }

        if ($this->option('sanitize-only') || $this->option('sanitize-existing')) {
            $this->info("Sanitizing existing products in database (description, dosage/strength, and size)...");
            $updated = $this->sanitizeExistingProducts();
            $this->info("Successfully sanitized {$updated} existing products in database.");

            if ($this->option('sanitize-only')) {
                return Command::SUCCESS;
            }
        }

        // Fetch Sitemap
        $this->info('Fetching MedsGo sitemap (https://medsgo.ph/images1.xml)...');
        try {
            $response = Http::withOptions(['verify' => false])
                ->timeout(30)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'])
                ->get('https://medsgo.ph/images1.xml');

            if (!$response->successful()) {
                $this->error('Failed to download sitemap from medsgo.ph (HTTP ' . $response->status() . ')');
                return Command::FAILURE;
            }

            $xmlContent = $response->body();
        } catch (\Throwable $e) {
            $this->error('Error connecting to medsgo.ph: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $sitemapItems = $this->parseSitemapUrls($xmlContent);
        $this->info("Found " . count($sitemapItems) . " total product URLs in sitemap.");

        // Filter URLs
        $candidates = $this->filterSitemapCandidates($sitemapItems, $categoryFilter, $limit);
        $this->info("Selected " . count($candidates) . " candidate products to scrape.");

        if (empty($candidates)) {
            $this->warn('No products matched the given criteria.');
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar(count($candidates));
        $bar->start();

        $savedCount = 0;
        $failedCount = 0;

        foreach ($candidates as $item) {
            $url = $item['url'];
            $sitemapImage = $item['image'];

            $productData = $this->scrapeProductPage($url, $sitemapImage);
            if (!$productData) {
                $failedCount++;
                $bar->advance();
                continue;
            }

            if ($dryRun) {
                $this->newLine();
                $this->line(" [PREVIEW] {$productData['name']} | PHP " . number_format($productData['price'], 2) . " | Strength: " . ($productData['strength'] ?? 'N/A') . " | Size: " . ($productData['size'] ?? 'N/A') . " | Rx: " . ($productData['is_prescribed'] ? 'Yes' : 'No') . " | Cat: {$productData['category']}");
                $savedCount++;
                $bar->advance();
                continue;
            }

            // Download image
            $imagePath = null;
            if (!$skipImages && !empty($productData['image_url'])) {
                $imagePath = $this->downloadProductImage($productData['image_url'], $productData['sku'] ?: Str::slug($productData['name']));
            }

            // Save to database
            try {
                $this->persistProduct(
                    $targetPharmacies,
                    $productData,
                    $imagePath,
                    $defaultStock
                );
                $savedCount++;
            } catch (\Throwable $e) {
                $this->error("Error saving '{$productData['name']}': " . $e->getMessage());
                $failedCount++;
            }

            $bar->advance();
            // Respectful throttle
            usleep(150000); // 150ms
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('========================================================================');
        $this->info("Scraping Completed!");
        $this->info("Successfully processed: {$savedCount} products");
        if ($failedCount > 0) {
            $this->warn("Failed / Skipped:        {$failedCount} products");
        }
        $this->info('========================================================================');

        return Command::SUCCESS;
    }

    /**
     * Parse URLs and primary images from XML sitemap.
     */
    private function parseSitemapUrls(string $xmlContent): array
    {
        $items = [];
        try {
            $xml = simplexml_load_string($xmlContent);
            if (!$xml) {
                return [];
            }

            $xml->registerXPathNamespace('sm', 'http://www.sitemaps.org/schemas/sitemap/0.9');
            $xml->registerXPathNamespace('image', 'http://www.google.com/schemas/sitemap-image/1.1');

            foreach ($xml->url as $urlNode) {
                $loc = (string) $urlNode->loc;
                $imgLoc = null;
                if (isset($urlNode->children('image', true)->image)) {
                    $imgLoc = (string) $urlNode->children('image', true)->image->loc;
                }

                if (!empty($loc)) {
                    $items[] = [
                        'url' => $loc,
                        'image' => $imgLoc,
                    ];
                }
            }
        } catch (\Throwable) {
            // Fallback to regex if simplexml has parser warnings
            preg_match_all('/<loc>(.*?)<\/loc>/is', $xmlContent, $locMatches);
            preg_match_all('/<image:loc>(.*?)<\/image:loc>/is', $xmlContent, $imgMatches);
            $locs = $locMatches[1] ?? [];
            $imgs = $imgMatches[1] ?? [];

            for ($i = 0; $i < count($locs); $i++) {
                $items[] = [
                    'url' => trim($locs[$i]),
                    'image' => isset($imgs[$i]) ? trim($imgs[$i]) : null,
                ];
            }
        }

        return $items;
    }

    /**
     * Filter and pick candidate products based on category or balanced selection.
     */
    private function filterSitemapCandidates(array $sitemapItems, string $filter, int $limit): array
    {
        if ($filter !== '') {
            $filtered = [];
            foreach ($sitemapItems as $item) {
                $u = strtolower($item['url']);
                if ($filter === 'rx' && str_contains($u, 'prescription-medicines')) {
                    $filtered[] = $item;
                } elseif ($filter === 'otc' && str_contains($u, 'over-the-counter-medicines')) {
                    $filtered[] = $item;
                } elseif (str_contains($u, $filter)) {
                    $filtered[] = $item;
                }

                if (count($filtered) >= $limit) {
                    break;
                }
            }
            return $filtered;
        }

        // If no filter, balance across major medical categories
        $categoriesToBalance = [
            'prescription-medicines/antibiotics',
            'prescription-medicines/respiratory',
            'prescription-medicines/diabetes',
            'prescription-medicines/cardio',
            'prescription-medicines/analgesic-and-pain-relievers',
            'over-the-counter-medicines/eye-and-ear',
            'over-the-counter-medicines/cough-cold-and-flu',
            'over-the-counter-medicines/pain-reliever-and-fever',
            'over-the-counter-medicines/gastro',
            'vitamins-and-supplements',
        ];

        $buckets = array_fill_keys($categoriesToBalance, []);
        $others = [];

        foreach ($sitemapItems as $item) {
            $u = strtolower($item['url']);
            $matched = false;
            foreach ($categoriesToBalance as $cat) {
                if (str_contains($u, $cat)) {
                    $buckets[$cat][] = $item;
                    $matched = true;
                    break;
                }
            }
            if (!$matched) {
                $others[] = $item;
            }
        }

        $selected = [];
        $perCategory = max(1, (int) ceil($limit / count($categoriesToBalance)));

        foreach ($buckets as $catItems) {
            $selected = array_merge($selected, array_slice($catItems, 0, $perCategory));
        }

        if (count($selected) < $limit) {
            $remaining = $limit - count($selected);
            $selected = array_merge($selected, array_slice($others, 0, $remaining));
        }

        return array_slice($selected, 0, $limit);
    }

    /**
     * Scrape individual product page HTML and parse JSON-LD.
     */
    private function scrapeProductPage(string $url, ?string $sitemapImage): ?array
    {
        try {
            $response = Http::withOptions(['verify' => false])
                ->timeout(15)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->get($url);

            if (!$response->successful()) {
                return null;
            }

            $html = $response->body();

            // Match JSON-LD Product schema
            if (!preg_match_all('/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is', $html, $matches)) {
                return null;
            }

            $productData = null;
            foreach ($matches[1] as $rawJson) {
                $decoded = json_decode(trim($rawJson), true);
                if (is_array($decoded) && str_contains($decoded['@type'] ?? '', 'Product')) {
                    $productData = $decoded;
                    break;
                }
            }

            if (!$productData) {
                return null;
            }

            $name = trim(preg_replace('/\bmedsgo(\.ph)?\b/i', '', (string) ($productData['name'] ?? '')));
            if ($name === '') {
                return null;
            }

            $sku = trim($productData['sku'] ?? '');
            $brand = is_array($productData['brand'] ?? null) 
                ? ($productData['brand']['name'] ?? '') 
                : (string) ($productData['brand'] ?? '');
            if (strtolower(trim($brand)) === 'medsgo') {
                $brand = 'Generic';
            }

            $description = $this->sanitizeDescription(trim($productData['description'] ?? ''));

            // Price extraction (strip any currency signs such as ₱ or PHP, or commas)
            $price = 0.0;
            if (!empty($productData['offers'])) {
                $offer = is_array($productData['offers']) && isset($productData['offers'][0]) 
                    ? $productData['offers'][0] 
                    : $productData['offers'];
                $rawPrice = $offer['price'] ?? 0;
                if (is_string($rawPrice)) {
                    $rawPrice = preg_replace('/[^\d.]/', '', str_replace(['₱', 'PHP', 'Php', ','], '', $rawPrice));
                }
                $price = (float) $rawPrice;
            }

            if ($price <= 0) {
                $price = 150.00; // Sensible staging default
            }

            // Image URL resolution
            $imageUrl = null;
            if (!empty($productData['image'])) {
                $imageUrl = is_array($productData['image']) ? $productData['image'][0] : $productData['image'];
            }
            if (empty($imageUrl)) {
                $imageUrl = $sitemapImage;
            }

            $isPrescribed = str_contains(strtolower($url), 'prescription-medicines') ? 1 : 0;

            // Extract dosage form, strength (dosage), size, and generic name
            $form = $this->extractForm($name, $description);
            $strength = $this->extractStrength($name, $description);
            $size = $this->extractSize($name, $description);
            $genericName = $this->extractGenericName($name, $brand);

            // Determine PharmaDali Category
            $categoryName = $this->determineCategory($url, $name, $brand, $genericName);

            return [
                'name' => $name,
                'brand' => $brand ?: 'Generic',
                'sku' => $sku,
                'description' => $description,
                'price' => $price,
                'image_url' => $imageUrl,
                'is_prescribed' => $isPrescribed,
                'form' => $form,
                'strength' => $strength,
                'size' => $size,
                'generic_name' => $genericName,
                'category' => $categoryName,
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Download and save product image to storage/app/public/products.
     */
    private function downloadProductImage(string $imageUrl, string $identifier): ?string
    {
        try {
            $res = Http::withOptions(['verify' => false])
                ->timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($imageUrl);

            if (!$res->successful()) {
                return null;
            }

            $body = $res->body();
            if (strlen($body) < 100) {
                return null;
            }

            // Extract extension
            $pathInfo = pathinfo(parse_url($imageUrl, PHP_URL_PATH) ?? '');
            $ext = strtolower($pathInfo['extension'] ?? 'webp');
            if (!in_array($ext, ['webp', 'png', 'jpg', 'jpeg'], true)) {
                $ext = 'webp';
            }

            $safeSlug = Str::slug(substr($identifier, 0, 40));
            $filename = "product_{$safeSlug}_" . substr(md5($imageUrl), 0, 8) . ".{$ext}";
            $relativePath = "products/{$filename}";

            Storage::disk('public')->put($relativePath, $body);

            return $relativePath;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Extract dosage form from title or description.
     */
    private function extractForm(string $title, string $desc): ?string
    {
        $patterns = [
            'Tablet' => '/\b(tablet|tab|tablets)\b/i',
            'Capsule' => '/\b(capsule|cap|capsules)\b/i',
            'Syrup' => '/\b(syrup|syr)\b/i',
            'Suspension' => '/\b(suspension|susp)\b/i',
            'Drops' => '/\b(drops|ophthalmic solution|eye drops|ear drops)\b/i',
            'Inhaler' => '/\b(inhaler|metered dose inhaler|act)\b/i',
            'Injection' => '/\b(injection|injectable|vial|ampoule|s\.c\.|i\.v\.)\b/i',
            'Cream' => '/\b(cream)\b/i',
            'Ointment' => '/\b(ointment)\b/i',
            'Gel' => '/\b(gel)\b/i',
            'Spray' => '/\b(spray|nasal spray)\b/i',
            'Lozenge' => '/\b(lozenge|lozenges)\b/i',
            'Gummies' => '/\b(gummies|gummy)\b/i',
            'Solution' => '/\b(solution)\b/i',
        ];

        foreach ($patterns as $form => $regex) {
            if (preg_match($regex, $title)) {
                return $form;
            }
        }

        foreach ($patterns as $form => $regex) {
            if (preg_match($regex, $desc)) {
                return $form;
            }
        }

        return 'Other';
    }

    /**
     * Extract dosage / strength metric from title or description (e.g. 20mg, 500mg, 100mcg, 400IU, 3%, 250mg / 5mL).
     */
    private function extractStrength(string $title, string $desc = ''): ?string
    {
        // 1. Percentage dosages: e.g. "30% / 70%", "3%", "0.05%"
        if (preg_match('/\b\d+(?:\.\d+)?%\s*(?:\/\s*\d+(?:\.\d+)?%|\s*per\s+ml)?/i', $title, $m)) {
            return trim($m[0]);
        }

        // 2. Compound or concentration dosages in title:
        // E.g. "100mg / 5mg / 50mcg", "500mg / 267mg / 160mg", "250mg / 5mL", "100mg / mL", "10mg / 1000mg", "325mg / 37.5mg", "2.5mg / 500mcg", "1mg / 3mg per mL"
        if (preg_match('/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu)\s*(?:\/\s*\d*(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|l|per\s+ml)\s*)+(?:per\s+ml)?/i', $title, $m)) {
            return trim($m[0]);
        }

        // 3. Single dosage metric: e.g. "500mg", "20mg", "100mcg", "400IU", "100IU"
        // Note: Never match standalone "ml" or "l" as strength!
        if (preg_match('/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|iu))\b/i', $title, $m)) {
            return trim($m[1]);
        }

        // 4. Fallback to Formulation / Ingredients in description if title doesn't specify strength
        if (!empty($desc) && !str_contains(strtolower($title), 'herbal')) {
            if (preg_match('/Formulation\s*\/\s*Ingredients[^\n:]*[:\n]\s*([^\n\r]+)/i', $desc, $dm)) {
                $ing = $dm[1];
                if (!str_contains($ing, 'teleconsultation') && !str_contains($ing, 'prescription')) {
                    if (preg_match_all('/\b\d+(?:\.\d+)?\s*(?:mg|mcg|iu|%)(?:\s*\/\s*\d*(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml))?/i', $ing, $im)) {
                        if (!empty($im[0])) {
                            $strengths = array_filter($im[0], fn($s) => !preg_match('/^\d+\s*ml$/i', trim($s)));
                            if (!empty($strengths)) {
                                return implode(' / ', array_slice(array_map('trim', $strengths), 0, 3));
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Extract package / container size (e.g. 5mL, 60mL, 10ml, 1 Tablet, 1 Sachet x 10ml, 200act.).
     */
    private function extractSize(string $title, string $desc = ''): ?string
    {
        // 1. Pack + volume combinations: "1 Sachet x 10ml", "1 Sachet 10ml", "3ml - 1 Pre-Filled Pen"
        if (preg_match('/\b(\d+\s*ml\s*-\s*\d+\s*(?:pre-filled\s+pen|pen|bottle|vial))\b/i', $title, $m)) {
            return trim($m[1]);
        }
        if (preg_match('/\b(\d+\s*sachets?(?:\s*[xX]\s*\d+\s*ml|\s+\d+\s*ml))\b/i', $title, $m)) {
            return trim($m[1]);
        }

        // 2. Look for standalone container volumes: e.g. "60mL", "10mL", "7.5mL", "15ml", "1L"
        // Negative lookbehind ensures it's NOT a concentration denominator like "per mL", "per 5mL", "/ mL", "/ 5mL"
        $volume = null;
        if (preg_match_all('/(?<!\/|per|\/5|\/10|\/15|\/20|\/25)\s*(\b\d+(?:\.\d+)?\s*(?:ml|l|liter|liters)\b)(?!\s*\/|\s*per)/i', $title, $allVolumes)) {
            $volumes = $allVolumes[1];
            if (!empty($volumes)) {
                $volume = trim(end($volumes));
            }
        }

        // 3. Piece count / packaging: e.g. "1 Tablet", "1 Capsule", "200act.", "30's", "1 Pre-Filled Pen"
        $pieces = null;
        if (preg_match('/\b(\d+\s*(?:chewable tablet|sustained release tablet|film[- ]coated tablet|tablet|tablets|capsule|capsules|cap|tab|piece|pieces|pcs|sachet|sachets|pre-filled pen|pen|act\.?|doses?|\'s))\b/i', $title, $m)) {
            $pieces = trim($m[1]);
        }

        if ($volume && $pieces) {
            return "{$volume} ({$pieces})";
        }
        if ($volume) {
            return $volume;
        }
        if ($pieces) {
            return $pieces;
        }

        return null;
    }

    /**
     * Sanitize product description by removing MedsGo-specific teleconsultation,
     * ordering text, branding, and phrases.
     */
    private function sanitizeDescription(?string $desc): ?string
    {
        if (empty($desc)) {
            return $desc;
        }

        $sanitized = $desc;

        // 1. Remove MedsGo teleconsultation / ordering sentences
        $sanitized = preg_replace(
            '/\s*But if you don\'t have one, you can get a free teleconsultation from (?:a\s+)?MedsGo Physician\.[^\.\n]*\./i',
            '',
            $sanitized
        );

        $sanitized = preg_replace(
            '/\s*You can order it right now on our website\./i',
            '',
            $sanitized
        );

        // 2. Replace "MedsGo Class" with "Drug Class"
        $sanitized = preg_replace('/\bMedsGo\s+Class\b/i', 'Drug Class', $sanitized);

        // 3. Clean any remaining occurrences of "MedsGo Physician" -> "Licensed Physician"
        $sanitized = preg_replace('/\bMedsGo\s+Physician\b/i', 'Licensed Physician', $sanitized);

        // 4. Any standalone MedsGo / medsgo.ph
        $sanitized = preg_replace('/\bmedsgo(\.ph)?\b/i', 'PharmaDali', $sanitized);

        // Clean up excessive blank lines
        $sanitized = preg_replace("/(\r?\n){3,}/", "\n\n", trim($sanitized));

        return $sanitized;
    }

    /**
     * Sanitize description, strength (dosage), and size for all existing products in the database.
     */
    public function sanitizeExistingProducts(): int
    {
        $products = Products::all();
        $updated = 0;

        foreach ($products as $product) {
            $cleanedDesc = $this->sanitizeDescription($product->description);
            $cleanedStrength = $this->extractStrength($product->product_name, $cleanedDesc);
            $cleanedSize = $this->extractSize($product->product_name, $cleanedDesc);

            $needsUpdate = false;
            $data = [];

            if ($cleanedDesc !== $product->description) {
                $data['description'] = $cleanedDesc;
                $needsUpdate = true;
            }

            if ($cleanedStrength !== $product->strength) {
                $data['strength'] = $cleanedStrength;
                $needsUpdate = true;
            }

            if ($cleanedSize !== $product->size) {
                $data['size'] = $cleanedSize;
                $needsUpdate = true;
            }

            if ($needsUpdate) {
                $product->update($data);
                $updated++;
            }
        }

        ProductBatch::where('supplier_name', 'LIKE', '%medsgo%')
            ->update(['supplier_name' => 'PharmaDali Staging Supplier']);

        return $updated;
    }

    /**
     * Extract generic active ingredient name.
     */
    private function extractGenericName(string $title, string $brand): ?string
    {
        // Many MedsGo titles follow: "BRAND Generic Strength Form Volume"
        // E.g., "OFLOBIZ Ofloxacin 3% Ophthalmic Solution 5mL"
        // or "Salbusol Salbutamol 100mcg Inhaler 200act."
        $clean = $title;
        if ($brand && str_starts_with(strtolower($clean), strtolower($brand))) {
            $clean = trim(substr($clean, strlen($brand)));
        }

        // Match first 1-3 words before strength or form
        if (preg_match('/^([A-Za-z\s\/\-\+]+?)(?=\s*\d|\s*tablet|\s*capsule|\s*syrup|\s*solution|\s*drops|\s*inhaler|$)/i', $clean, $m)) {
            $extracted = trim($m[1], " \t\n\r\0\x0B/-");
            if (strlen($extracted) >= 3 && !in_array(strtolower($extracted), ['the', 'for', 'with'], true)) {
                return ucwords(strtolower($extracted));
            }
        }

        return $brand ?: null;
    }

    /**
     * Map URL / Product details to PharmaDali category.
     */
    private function determineCategory(string $url, string $title, string $brand, ?string $generic): string
    {
        $u = strtolower($url);
        $t = strtolower($title);

        if (str_contains($u, 'eye-and-ear') || str_contains($t, 'eye') || str_contains($t, 'ophthalmic') || str_contains($t, 'ear drops')) {
            return 'Eye Med';
        }
        if (str_contains($u, 'vitamins') || str_contains($t, 'vitamin') || str_contains($t, 'supplement')) {
            return 'Vitamins';
        }
        if (str_contains($t, 'cream') || str_contains($t, 'ointment') || str_contains($t, 'gel')) {
            return 'Cream/Ointment';
        }
        if (str_contains($u, 'hygiene') || str_contains($t, 'lotion') || str_contains($t, 'soap')) {
            return 'Hygiene';
        }
        if (str_contains($u, 'cosmetics')) {
            return 'Cosmetics';
        }
        if (str_contains($u, 'diaper')) {
            return 'Diapers';
        }
        if (str_contains($u, 'baby') || str_contains($u, 'infant')) {
            return 'Infant';
        }
        if (str_contains($u, 'milk')) {
            return 'Milk';
        }
        if (str_contains($u, 'drinks') || str_contains($t, 'drinks') || str_contains($t, 'beverage')) {
            return 'Drinks';
        }
        if (str_contains($t, 'insulin') || str_contains($t, 'injection') || str_contains($t, 'vial')) {
            return 'Injectables/Vial';
        }
        if (str_contains($u, 'medical-supplies') || str_contains($t, 'strip') || str_contains($t, 'syringe') || str_contains($t, 'gauze')) {
            return 'Supplies';
        }

        // If generic matches brand or no distinctive brand name
        if (empty($brand) || strtolower($brand) === 'generic' || ($generic && strcasecmp($brand, $generic) === 0)) {
            return 'Generic';
        }

        return 'Branded';
    }

    /**
     * Persist Product, PharmacyProduct, and ProductBatch in database across all target pharmacies.
     */
    private function persistProduct($targetPharmacies, array $data, ?string $imagePath, int $stock): void
    {
        PharmacyProduct::withoutSyncingToSearch(function () use ($targetPharmacies, $data, $imagePath, $stock) {
            // 1. Resolve or create category
            $categoryName = $data['category'];
            $category = Category::where('category_name', $categoryName)->first()
                ?? Category::firstOrCreate(
                    ['category_name' => $categoryName],
                    [
                        'description' => "Category for {$categoryName}",
                        'is_enabled' => true,
                        'background_color' => '#48AAD9',
                        'font_color' => '#FFFFFF',
                        'hero_title' => "{$categoryName} Essentials",
                        'hero_subtitle_template' => "Explore our recommended {$categoryName} products",
                    ]
                );

            $unitCost = round($data['price'] * 0.70, 2); // 30% margin for staging

            foreach ($targetPharmacies as $pharmacy) {
                $pharmacyId = $pharmacy->id;

                // Ensure category is enabled for this pharmacy
                DB::table('pharmacy_categories')->updateOrInsert(
                    ['pharmacy_id' => $pharmacyId, 'category_id' => $category->id],
                    ['is_enabled' => true, 'updated_at' => now(), 'created_at' => now()]
                );

                // 2. Create or update Products record for this pharmacy
                $product = Products::updateOrCreate(
                    [
                        'pharmacy_id' => $pharmacyId,
                        'product_name' => $data['name'],
                    ],
                    [
                        'product_type' => 'medicine',
                        'generic_name' => $data['generic_name'],
                        'brand_name' => $data['brand'],
                        'description' => $data['description'],
                        'form' => $data['form'],
                        'strength' => $data['strength'],
                        'size' => $data['size'] ?? null,
                        'is_prescribed' => $data['is_prescribed'],
                        'image_path' => $imagePath,
                    ]
                );

                // 3. Create or update PharmacyProduct record for this pharmacy
                $pharmacyProduct = PharmacyProduct::updateOrCreate(
                    [
                        'pharmacy_id' => $pharmacyId,
                        'product_id' => $product->id,
                    ],
                    [
                        'category_id' => $category->id,
                        'stock' => $stock,
                        'unit_cost' => $unitCost,
                        'selling_price' => $data['price'],
                        'is_discountable' => true,
                        'is_available' => true,
                        'is_out_of_stock' => false,
                        'is_expired' => false,
                        'lead_time_days' => 3,
                    ]
                );

                // 4. Create or update ProductBatch record for FEFO inventory
                $existingBatch = ProductBatch::where('pharmacy_product_id', $pharmacyProduct->id)->first();
                $batchNumber = $existingBatch?->batch_number ?: ('STAGING-' . strtoupper(substr(md5($product->id . $product->product_name . $pharmacyId), 0, 8)));

                ProductBatch::updateOrCreate(
                    [
                        'pharmacy_product_id' => $pharmacyProduct->id,
                        'batch_number' => $batchNumber,
                    ],
                    [
                        'supplier_name' => 'PharmaDali Staging Supplier',
                        'stock' => $stock,
                        'expiry_date' => now()->addMonths(18)->format('Y-m-d'),
                        'manufactured_date' => now()->subMonths(2)->format('Y-m-d'),
                        'received_at' => now(),
                    ]
                );
            }
        });
    }
}
