<?php

namespace App\Models\Concerns;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    /**
     * Boot the trait to add the global scope.
     */
    protected static function bootBelongsToTenant()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $currentTenant = Tenant::current();

            if ($currentTenant) {
                $builder->where($builder->getModel()->getTable() . '.pharmacy_id', $currentTenant->id);
            }
        });

        static::creating(function ($model) {
            $currentTenant = Tenant::current();

            if ($currentTenant && empty($model->pharmacy_id)) {
                $model->pharmacy_id = $currentTenant->id;
            }
        });
    }

    /**
     * Get the tenant (pharmacy) that owns the model.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'pharmacy_id');
    }
}
