<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Pharmacist extends Model
{
    public const DEFAULT_PERMISSIONS = [
        'access_pos',
        'access_pickup',
        'view_inventory',
        'view_sales_reports',
        'process_item_exchange',
    ];

    protected $fillable = [
        'user_id',
        'employee_number',
        'license_number',
        'permissions',
        'requires_password_change',
        'is_on_duty',
        'duty_updated_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'requires_password_change' => 'boolean',
        'is_on_duty' => 'boolean',
        'duty_updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pharmacy(): HasOneThrough
    {
        return $this->hasOneThrough(
            Pharmacy::class,
            User::class,
            'id',          // Foreign key on users table (matches pharmacist.user_id)
            'id',          // Foreign key on pharmacies table (matches user.pharmacy_id)
            'user_id',     // Local key on pharmacists table
            'pharmacy_id'  // Local key on users table
        );
    }

    /**
     * Check if the pharmacist has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        $permissions = $this->permissions;
        if ($permissions === null) {
            $permissions = self::DEFAULT_PERMISSIONS;
        }

        return in_array($permission, $permissions, true);
    }
}

