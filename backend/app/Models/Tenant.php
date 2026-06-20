<?php

namespace App\Models;

use Spatie\Multitenancy\Models\Tenant as BaseTenant;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends BaseTenant
{
    use SoftDeletes;

    protected $table = 'pharmacies';

    protected $fillable = [
        'pharmacy_name',
        'location',
        'contact_number',
        'is_active',
    ];
}
