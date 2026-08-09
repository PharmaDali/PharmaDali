<?php

namespace App\Repositories;

use App\Models\Pharmacy;

class PharmacySettingsRepository
{
    /**
     * Find a pharmacy by its ID for settings management.
     */
    public function findByPharmacyId(int $pharmacyId): Pharmacy
    {
        return Pharmacy::findOrFail($pharmacyId);
    }

    /**
     * Persist updated pharmacy settings.
     * Uses fill + save so Eloquent model events fire correctly.
     */
    public function update(Pharmacy $pharmacy, array $data): Pharmacy
    {
        $pharmacy->fill($data);
        $pharmacy->save();

        return $pharmacy->fresh();
    }

    /**
     * Update the stored logo path and persist.
     */
    public function updateLogo(Pharmacy $pharmacy, string $path): Pharmacy
    {
        $pharmacy->logo_path = $path;
        $pharmacy->save();

        return $pharmacy->fresh();
    }
}
