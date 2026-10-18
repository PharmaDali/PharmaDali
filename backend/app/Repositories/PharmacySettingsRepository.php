<?php

namespace App\Repositories;

use App\Models\Pharmacist;
use App\Models\Pharmacy;
use Illuminate\Support\Facades\Cache;

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

        if (!$pharmacy->isCurrentlyOpen()) {
            Pharmacist::whereHas('user', function ($query) use ($pharmacy) {
                $query->where('pharmacy_id', $pharmacy->id);
            })->where('is_on_duty', true)->update([
                'is_on_duty'      => false,
                'duty_updated_at' => now(),
            ]);
        }

        Cache::forget('pharmacies_all');
        Cache::forget("pharmacy_{$pharmacy->id}");

        return $pharmacy->fresh();
    }

    /**
     * Update the stored logo path and persist.
     */
    public function updateLogo(Pharmacy $pharmacy, string $path): Pharmacy
    {
        $pharmacy->logo_path = $path;
        $pharmacy->save();

        Cache::forget('pharmacies_all');
        Cache::forget("pharmacy_{$pharmacy->id}");

        return $pharmacy->fresh();
    }
}
