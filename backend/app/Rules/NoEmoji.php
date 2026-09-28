<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NoEmoji implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            return;
        }

        // Matches extended pictographs, emoji presentation symbols, and standard Unicode emoji ranges
        $emojiPattern = '/(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{FE00}-\x{FE0F}])/u';

        if (preg_match($emojiPattern, $value)) {
            $attributeName = str_replace('_', ' ', $attribute);
            $fail("The {$attributeName} cannot contain emojis.");
        }
    }
}
