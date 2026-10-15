<?php

namespace App\Services\Media;

use DateTimeInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class PrivateMediaUrlGenerator
{
    /**
     * Default validity duration for signed media URLs (24 hours).
     */
    private const DEFAULT_EXPIRATION_HOURS = 24;

    /**
     * Generate a signed temporary URL for a private file.
     * Falls back to public disk URL if the file exists on the legacy public disk.
     */
    public function generateUrl(?string $path, ?DateTimeInterface $expiration = null): ?string
    {
        if (!$path) {
            return null;
        }

        $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');

        // Check legacy public storage during migration transition
        if (!Storage::disk('local')->exists($normalizedPath) && Storage::disk('public')->exists($normalizedPath)) {
            return Storage::disk('public')->url($normalizedPath);
        }

        $expiresAt = $expiration ?? now()->addHours(self::DEFAULT_EXPIRATION_HOURS);

        return URL::temporarySignedRoute(
            'media.private',
            $expiresAt,
            ['path' => $normalizedPath],
            absolute: true
        );
    }
}

