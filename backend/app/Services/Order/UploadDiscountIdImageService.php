<?php

namespace App\Services\Order;

use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;

class UploadDiscountIdImageService
{
    private const MAX_WIDTH   = 1200;
    private const MAX_HEIGHT  = 1200;
    private const QUALITY     = 80;
    private const DISK        = 'public';
    private const STORAGE_DIR = 'discount_ids';

    /**
     * Compress, store, and attach a discount customer ID image to an order.
     *
     * @param Order        $order
     * @param UploadedFile $file
     * @param mixed        $user
     * @return Order
     * @throws \Exception
     */
    
    public function handle(Order $order, UploadedFile $file, $user, ?string $discountType = null, ?string $discountIdNumber = null): Order
    {
        if (!$user) {
            throw new \Exception("Unauthorized", 401);
        }

        // Verify order ownership (must match user's pharmacy or customer ID)
        $isPharmacyUser = isset($user->pharmacy_id) && $user->pharmacy_id === $order->pharmacy_id;
        $isCustomerUser = isset($user->customer) && $user->customer && $user->customer->id === $order->customer_id;

        if (!$isPharmacyUser && !$isCustomerUser) {
            throw new \Exception("Unauthorized: Order does not belong to your account or pharmacy.", 403);
        }

        // Delete previous image if one exists
        if ($order->discount_id_image_path && Storage::disk(self::DISK)->exists($order->discount_id_image_path)) {
            Storage::disk(self::DISK)->delete($order->discount_id_image_path);
        }

        // Compress and convert to WebP using Intervention Image GD driver
        $manager = new ImageManager(new Driver());
        $image   = $manager->decodePath($file->getRealPath());

        // Scale down proportionally only if larger than the maximum dimensions
        $image->scaleDown(self::MAX_WIDTH, self::MAX_HEIGHT);

        $filename = $order->id . '_' . time() . '.webp';
        $relativePath = self::STORAGE_DIR . '/' . $order->pharmacy_id . '/' . $filename;

        $encodedImage = $image->encode(new WebpEncoder(self::QUALITY));

        Storage::disk(self::DISK)->put(
            $relativePath,
            $encodedImage->toString()
        );

        // Update and save order
        $order->discount_id_image_path = $relativePath;
        if ($discountType) {
            $order->discount_type = $discountType;
        }
        if ($discountIdNumber) {
            $order->discount_id_number = $discountIdNumber;
        }
        $order->save();

        return $order->fresh();
    }
}
