<?php

namespace App\Services\ProductImage;

use App\Models\BranchProduct;
use Illuminate\Support\Facades\Storage;

class RenderProductSvgService
{
    private const DEFAULT_FILL = '#000000';
    private const DEFAULT_STROKE = '#000000';

    private const CATEGORY_COLORS = [
        'branded' => ['fill' => '#48AAD9', 'stroke' => '#2D9CDB'],
        'generic' => ['fill' => '#01A768', 'stroke' => '#01A768'],
        'injectables' => ['fill' => '#1B6CA8', 'stroke' => '#1B6CA8'],
        'eye med' => ['fill' => '#67A1B4', 'stroke' => '#67A1B4'],
        'cream' => ['fill' => '#B059D0', 'stroke' => '#B059D0'],
        'cosmetics' => ['fill' => '#F2577C', 'stroke' => '#F2577C'],
        'hygiene' => ['fill' => '#31C0B3', 'stroke' => '#31C0B3'],
        'diapers' => ['fill' => '#72AAD9', 'stroke' => '#72AAD9'],
        'infant' => ['fill' => '#FB8A79', 'stroke' => '#FB8A79'],
        'milk' => ['fill' => '#DAB55A', 'stroke' => '#DAB55A'],
        'drinks' => ['fill' => '#F2994A', 'stroke' => '#F2994A'],
        'vitamins' => ['fill' => '#E2B019', 'stroke' => '#E2B019'],
    ];

    public function render(BranchProduct $branchProduct, ?string $quantity = null): string
    {
        $product = $branchProduct->product;
        $category = $branchProduct->category;

        $templatePath = $this->resolveTemplatePath($product->generic_name, $product->strength, $product->form, (bool) $product->is_prescribed);
        $svg = Storage::disk('public')->get($templatePath);

        $color = $this->resolveCategoryColors($category?->category_name);
        $svg = $this->applyColors($svg, $color['fill'], $color['stroke']);

        $values = $this->buildPlaceholderValues(
            $product->generic_name,
            $product->brand_name ?: $product->product_name,
            $product->strength,
            $product->form,
            $quantity,
        );

        $svg = $this->applyFontSizing($svg, $values);
        $svg = $this->replacePlaceholders($svg, $values);

        return $svg;
    }

    private function resolveTemplatePath(?string $generic, ?string $strength, ?string $form, bool $isPrescribed): string
    {
        $hasGeneric = $this->hasValue($generic);
        $hasStrengthOrForm = $this->hasValue($strength) || $this->hasValue($form);

        if ($isPrescribed) {
            $base = 'products/img/templates/prescribed';

            if ($hasGeneric) {
                return $base . '/branded-detailed.svg';
            }

            if ($hasStrengthOrForm) {
                return $base . '/branded-no-generic-name.svg';
            }

            return $base . '/branded-brand-name-only.svg';
        }

        $base = 'products/img/templates';

        if ($hasGeneric) {
            return $base . '/branded-detailed.svg';
        }

        if ($hasStrengthOrForm) {
            return $base . '/no-generic-name.svg';
        }

        return $base . '/brand-name-only.svg';
    }

    private function resolveCategoryColors(?string $categoryName): array
    {
        $key = $this->normalizeCategoryKey($categoryName);
        return self::CATEGORY_COLORS[$key] ?? [
            'fill' => self::DEFAULT_FILL,
            'stroke' => self::DEFAULT_STROKE,
        ];
    }

    private function normalizeCategoryKey(?string $categoryName): string
    {
        $value = strtolower(trim((string) $categoryName));
        $value = preg_replace('/[^a-z0-9]+/', ' ', $value) ?? '';
        return trim($value);
    }

    private function applyColors(string $svg, string $fillColor, string $strokeColor): string
    {
        $svg = str_replace('fill="black"', 'fill="' . $fillColor . '"', $svg);
        $svg = str_replace('stroke="black"', 'stroke="' . $strokeColor . '"', $svg);
        return $svg;
    }

    private function buildPlaceholderValues(?string $generic, ?string $brand, ?string $strength, ?string $form, ?string $quantity): array
    {
        $genericText = $this->cleanText($generic);
        $brandText = $this->cleanText($brand);
        $strengthText = $this->cleanText($strength);
        $formText = $this->cleanText($form);
        $quantityText = $this->cleanText($quantity);

        if ($strengthText !== '' && $formText !== '') {
            $strengthText .= ' ';
        }

        if ($quantityText !== '' && $formText !== '') {
            $quantityText .= ' ';
        }

        return [
            '{{generic}}' => $genericText,
            '{{brand}}' => $brandText,
            '{{strength}}' => $strengthText,
            '{{form}}' => $formText,
            '{{quantity}}' => $quantityText,
        ];
    }

    private function applyFontSizing(string $svg, array $values): string
    {
        $svg = $this->applyFontRule($svg, '{{generic}}', $values['{{generic}}'], 18, 10);
        $svg = $this->applyFontRule($svg, '{{brand}}', $values['{{brand}}'], 18, 12);

        return $svg;
    }

    private function applyFontRule(string $svg, string $token, string $value, int $maxChars, int $smallSize): string
    {
        if ($this->stringLength($value) <= $maxChars) {
            return $svg;
        }

        $escapedToken = preg_quote($token, '/');

        return preg_replace(
            '/(<text[^>]*id="' . $escapedToken . '"[^>]*font-size=")([^"]+)(")/i',
            '$1' . $smallSize . '$3',
            $svg,
            1,
        ) ?? $svg;
    }

    private function replacePlaceholders(string $svg, array $values): string
    {
        foreach ($values as $token => $value) {
            $svg = str_replace($token, $this->escapeText($value), $svg);
        }

        return $svg;
    }

    private function hasValue(?string $value): bool
    {
        return trim((string) $value) !== '';
    }

    private function cleanText(?string $value): string
    {
        return trim((string) $value);
    }

    private function escapeText(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function stringLength(string $value): int
    {
        if (function_exists('mb_strlen')) {
            return mb_strlen($value);
        }

        return strlen($value);
    }
}
