<?php

namespace App\Services\Pharmacy;

use App\Models\Pharmacy;
use App\Models\User;
use App\Repositories\PharmacySettingsRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PharmacySettingsService
{
    public function __construct(
        private readonly PharmacySettingsRepository $repository,
    ) {}

    /**
     * Return the full settings payload for the admin's pharmacy.
     */
    public function getSettings(User $admin): array
    {
        $pharmacy = $this->repository->findByPharmacyId($admin->pharmacy_id);

        return [
            'pharmacy' => [
                'id'                     => $pharmacy->id,
                'pharmacy_name'          => $pharmacy->pharmacy_name,
                'location'               => $pharmacy->location,
                'contact_number'         => $pharmacy->contact_number,
                'email'                  => $pharmacy->email,
                'logo_url'               => $pharmacy->logo_url,
                'opening_hour'           => $pharmacy->opening_hour,
                'closing_hour'           => $pharmacy->closing_hour,
                'is_active'              => $pharmacy->is_active,
            ],
            'alert_thresholds' => [
                'low_stock'      => $pharmacy->low_stock_threshold,
                'shortage_days'  => $pharmacy->shortage_days_threshold,
                'expiry_days'    => $pharmacy->expiry_days_threshold,
            ],
        ];
    }

    /**
     * Update pharmacy settings and persist via the repository.
     */
    public function updateSettings(User $admin, array $data): Pharmacy
    {
        $pharmacy = $this->repository->findByPharmacyId($admin->pharmacy_id);

        $allowed = [
            'pharmacy_name',
            'location',
            'contact_number',
            'email',
            'opening_hour',
            'closing_hour',
            'is_active',
            'low_stock_threshold',
            'shortage_days_threshold',
            'expiry_days_threshold',
        ];

        $filteredData = array_intersect_key($data, array_flip($allowed));

        return $this->repository->update($pharmacy, $filteredData);
    }

    /**
     * Store the uploaded logo on the public disk, remove the old one, and persist the path.
     */
    public function uploadLogo(User $admin, UploadedFile $file): string
    {
        $pharmacy = $this->repository->findByPharmacyId($admin->pharmacy_id);

        // Delete previous logo if one exists
        if ($pharmacy->logo_path && Storage::disk('public')->exists($pharmacy->logo_path)) {
            Storage::disk('public')->delete($pharmacy->logo_path);
        }

        $path = $file->store("logos/pharmacy_{$pharmacy->id}", 'public');

        $this->repository->updateLogo($pharmacy, $path);

        return Storage::disk('public')->url($path);
    }
}
