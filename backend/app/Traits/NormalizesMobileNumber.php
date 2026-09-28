<?php

namespace App\Traits;

trait NormalizesMobileNumber
{
    /**
     * Automatically prepare the request for validation by normalizing mobile numbers.
     */
    protected function prepareForValidation(): void
    {
        $this->normalizeRequestMobileField('mobile_number');
    }

    /**
     * Normalizes a specified mobile field on the request.
     */
    protected function normalizeRequestMobileField(string $fieldName = 'mobile_number'): void
    {
        if ($this->has($fieldName) && is_string($this->input($fieldName))) {
            $this->merge([
                $fieldName => $this->normalizeMobileNumber($this->input($fieldName)),
            ]);
        }
    }

    /**
     * Normalizes Philippine mobile numbers (+63, 63, dashes, spaces, parentheses) into standard 09XXXXXXXXX format.
     */
    public function normalizeMobileNumber(?string $mobile): ?string
    {
        if (!is_string($mobile)) {
            return $mobile;
        }

        $cleaned = trim($mobile);
        $cleaned = preg_replace('/[\s\-\(\)\.]/', '', $cleaned);

        if (str_starts_with($cleaned, '+63')) {
            $cleaned = '0' . substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '63') && strlen($cleaned) > 2 && $cleaned[2] === '9') {
            $cleaned = '0' . substr($cleaned, 2);
        } elseif (strlen($cleaned) === 10 && str_starts_with($cleaned, '9')) {
            $cleaned = '0' . $cleaned;
        }

        return $cleaned;
    }
}
