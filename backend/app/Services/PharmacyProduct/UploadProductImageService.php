<?php

namespace App\Services\PharmacyProduct;

use App\Models\Products;
use App\Repositories\ProductRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\WebpEncoder;

class UploadProductImageService
{
    // Compression settings
    private const MAX_WIDTH    = 800;
    private const MAX_HEIGHT   = 800;
    private const QUALITY      = 75;
    private const DISK         = 'public';
    private const STORAGE_DIR  = 'products';

    public function __construct(
        private readonly ProductRepository $productRepository,
    ) {}

    /**
     * Compress, store, and persist a product image.
     *
     * Images are stored at: products/{pharmacy_id}/{product_id}.webp
     * This path is scoped per pharmacy by design; ownership is already verified
     * before this service is called (via Gate::authorize in the controller).
     *
     * @param int          $productId
     * @param UploadedFile $file
     * @param int          $pharmacyId
     * @return Products
     */
    public function handle(int $productId, UploadedFile $file, int $pharmacyId): Products
    {
        $product = $this->productRepository->find($productId);

        // Delete previous image if one exists
        if ($product->image_path && Storage::disk(self::DISK)->exists($product->image_path)) {
            Storage::disk(self::DISK)->delete($product->image_path);
        }

        // Compress and convert to WebP (or fallback to JPEG if GD lacks WebP support)
        $supportsWebp = function_exists('imagewebp') && function_exists('imagecreatefromwebp');
        $extension    = $supportsWebp ? 'webp' : 'jpg';
        $relativePath = self::STORAGE_DIR . '/' . $pharmacyId . '/' . $productId . '.' . $extension;

        try {
            $manager = new ImageManager(new Driver());
            $image   = $manager->decodePath($file->getRealPath());

            // Scale down proportionally only if larger than the cap
            $image->scaleDown(self::MAX_WIDTH, self::MAX_HEIGHT);

            $encoder = $supportsWebp
                ? new WebpEncoder(self::QUALITY)
                : new JpegEncoder(self::QUALITY);

            $encodedImage = $image->encode($encoder);

            Storage::disk(self::DISK)->put(
                $relativePath,
                $encodedImage->toString()
            );
        } catch (\Throwable $e) {
            $fallbackExt  = $file->getClientOriginalExtension() ?: 'jpg';
            $filename     = $productId . '.' . $fallbackExt;
            $relativePath = self::STORAGE_DIR . '/' . $pharmacyId . '/' . $filename;

            Storage::disk(self::DISK)->putFileAs(
                self::STORAGE_DIR . '/' . $pharmacyId,
                $file,
                $filename
            );
        }

        // Persist the relative path
        $this->productRepository->update($product, ['image_path' => $relativePath]);

        return $product->fresh();
    }
}
