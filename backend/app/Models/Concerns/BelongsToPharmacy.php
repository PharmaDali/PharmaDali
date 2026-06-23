<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToPharmacy
{
    protected static ?int $currentPharmacyId = null;

    /**
     * Set a specific pharmacy context (useful for CLI/Queue Jobs)
     */
    public static function setPharmacyContext(?int $pharmacyId)
    {
        self::$currentPharmacyId = $pharmacyId;
    }

    /**
     * Resolve the current pharmacy ID based on context.
     */
    public static function getPharmacyContext(): ?int
    {
        // 1. Manually set context (e.g., from a Queue Job)
        if (self::$currentPharmacyId !== null) {
            return self::$currentPharmacyId;
        }

        // 2. Authenticated user's pharmacy
        $user = auth()->user();
        if ($user && $user->pharmacy_id) {
            return (int) $user->pharmacy_id;
        }

        // 3. Header-based context (for Customers)
        $headerPharmacyId = request()->header('X-Pharmacy-ID');
        if ($headerPharmacyId) {
            return (int) $headerPharmacyId;
        }

        return null;
    }

    /**
     * Boot the trait to add the global scope.
     */
    protected static function bootBelongsToPharmacy()
    {
        static::addGlobalScope('pharmacy', function (Builder $builder) {
            $pharmacyId = self::getPharmacyContext();

            if ($pharmacyId) {
                $builder->where($builder->getModel()->getTable() . '.pharmacy_id', $pharmacyId);
            }
        });

        static::creating(function ($model) {
            $pharmacyId = self::getPharmacyContext();

            if ($pharmacyId && empty($model->pharmacy_id)) {
                $model->pharmacy_id = $pharmacyId;
            }
        });
    }

    /**
     * Get the pharmacy that owns the model.
     */
    public function pharmacy()
    {
        return $this->belongsTo(\App\Models\Pharmacy::class, 'pharmacy_id');
    }
}
