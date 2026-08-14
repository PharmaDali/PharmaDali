<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

