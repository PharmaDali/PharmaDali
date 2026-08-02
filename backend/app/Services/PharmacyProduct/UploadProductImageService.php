<?php

namespace App\Services\PharmacyProduct;

use App\Models\Products;
use App\Repositories\ProductRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

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

        // Compress and convert to WebP using GD (no external binary needed)
        $manager = new ImageManager(new Driver());
        $image   = $manager->read($file->getRealPath());

        // Scale down proportionally only if larger than the cap
        $image->scaleDown(self::MAX_WIDTH, self::MAX_HEIGHT);

        $relativePath = self::STORAGE_DIR . '/' . $pharmacyId . '/' . $productId . '.webp';

        Storage::disk(self::DISK)->put(
            $relativePath,
            $image->toWebp(self::QUALITY)->toString()
        );

        // Persist the relative path
        $this->productRepository->update($product, ['image_path' => $relativePath]);

        return $product->fresh();
    }
}
