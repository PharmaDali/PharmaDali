<?php

namespace App\Services\Media;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\OrderItemPrescription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ServePrivateMediaService
{
    private const ALLOWED_PREFIXES = [
        'chat_images/',
        'discount_ids/',
        'payment_receipts/',
        'prescriptions/',
    ];

    /**
     * Validate and stream private media content with strict authorization and security headers.
     */
    public function handle(Request $request, string $path): Response
    {
        $normalizedPath = $this->sanitizePath($path);

        if (!$this->isAllowedPrefix($normalizedPath)) {
            abort(403, 'Unauthorized directory access.');
        }

        if (!$this->isAuthorized($request, $normalizedPath)) {
            abort(403, 'Unauthorized access to private media.');
        }

        $disk = $this->resolveDisk($normalizedPath);

        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        ];

        return Storage::disk($disk)->response($normalizedPath, null, $headers);
    }

    /**
     * Sanitize path and prevent directory traversal.
     */
    public function sanitizePath(string $path): string
    {
        $normalizedPath = str_replace('\\', '/', $path);

        if (str_contains($normalizedPath, '..') || str_contains($normalizedPath, "\0")) {
            abort(404);
        }

        return ltrim($normalizedPath, '/');
    }

    /**
     * Check if path starts with one of the allowed directory prefixes.
     */
    public function isAllowedPrefix(string $path): bool
    {
        foreach (self::ALLOWED_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if request has a valid HMAC signature or belongs to an authorized user.
     */
    public function isAuthorized(Request $request, string $path): bool
    {
        if ($request->hasValidSignature() || $request->hasValidRelativeSignature()) {
            return true;
        }

        return $this->authorizeUser($request, $path);
    }

    /**
     * Resolve the filesystem disk where the media exists.
     */
    public function resolveDisk(string $path): string
    {
        if (Storage::disk('local')->exists($path)) {
            return 'local';
        }

        if (Storage::disk('public')->exists($path)) {
            return 'public';
        }

        abort(404, 'File not found.');
    }

    /**
     * Verify whether an authenticated Sanctum user is permitted to view the requested file.
     */
    private function authorizeUser(Request $request, string $path): bool
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user() ?? $request->user();

        if (!$user) {
            return false;
        }

        // Pharmacy staff and system administrators can view all operational order media
        if (in_array($user->role, ['pharmacy_admin', 'pharmacist', 'super_admin'], true)) {
            return true;
        }

        // Customer access control: verify ownership of the linked order or conversation
        if ($user->role === 'customer') {
            $customerId = $user->customer?->id;
            if (!$customerId) {
                return false;
            }

            if (str_starts_with($path, 'prescriptions/')) {
                return OrderItemPrescription::query()
                    ->where('prescription_image_path', $path)
                    ->whereHas('orderItem.order', function ($query) use ($customerId) {
                        $query->withoutGlobalScopes()->where('customer_id', $customerId);
                    })
                    ->exists();
            }

            if (str_starts_with($path, 'discount_ids/')) {
                return Order::query()
                    ->withoutGlobalScopes()
                    ->where('discount_id_image_path', $path)
                    ->where('customer_id', $customerId)
                    ->exists();
            }

            if (str_starts_with($path, 'payment_receipts/')) {
                return Order::query()
                    ->withoutGlobalScopes()
                    ->where('payment_receipt_image_path', $path)
                    ->where('customer_id', $customerId)
                    ->exists();
            }

            if (str_starts_with($path, 'chat_images/')) {
                return Conversation::query()
                    ->where('customer_user_id', $user->id)
                    ->whereHas('messages', function ($query) use ($path) {
                        $query->where('metadata->image_path', $path);
                    })
                    ->exists();
            }
        }

        return false;
    }
}
