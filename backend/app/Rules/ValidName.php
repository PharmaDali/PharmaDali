<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidName implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $attributeName = str_replace('_', ' ', $attribute);
            $fail("The {$attributeName} must be a valid string.");
            return;
        }

        $trimmed = trim($value);
        $length = mb_strlen($trimmed, 'UTF-8');
        $attributeName = str_replace('_', ' ', $attribute);

        if ($length < 2 || $length > 50) {
            $fail("The {$attributeName} must be between 2 and 50 characters.");
            return;
        }

        // Only allow letters (including accents and ñ/Ñ), spaces, hyphens, apostrophes, and periods
        if (!preg_match('/^[\p{L}\s\'\-\.]+$/u', $trimmed)) {
            $fail("The {$attributeName} can only contain letters, spaces, hyphens, and apostrophes.");
            return;
        }

        // Emoji check
        $emojiPattern = '/(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{FE00}-\x{FE0F}])/u';
        if (preg_match($emojiPattern, $trimmed)) {
            $fail("The {$attributeName} cannot contain emojis.");
        }
    }
}
