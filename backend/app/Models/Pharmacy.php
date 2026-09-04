<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Pharmacy extends Model
{
    use SoftDeletes;

    protected $table = 'pharmacies';

    protected $fillable = [
        'pharmacy_name',
        'location',
        'contact_number',
        'email',
        'logo_path',
        'is_active',
        'opening_hour',
        'closing_hour',
        'low_stock_threshold',
        'shortage_days_threshold',
        'expiry_days_threshold',
        'enable_vat_exemption_discount',
        'allow_otc_discount',
        'item_exchange_window_days',
        'allow_item_exchange',
        'allow_cash_refund',
        // BIR / POS receipt compliance fields
        'tin',
        'vat_type',
        'bir_permit_no',
        'permit_issued_at',
        'ptu_valid_until',
        'machine_no',
        'serial_no',
        'accreditation_no',
    ];

    protected $casts = [
        'enable_vat_exemption_discount' => 'boolean',
        'allow_otc_discount'            => 'boolean',
        'allow_item_exchange'           => 'boolean',
        'allow_cash_refund'             => 'boolean',
        'item_exchange_window_days'     => 'integer',
        'permit_issued_at' => 'date',
        'ptu_valid_until'  => 'date',
    ];

    /**
     * Get the full public URL for the pharmacy logo.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'pharmacy_id');
    }

    public function admins()
    {
        return $this->hasMany(User::class, 'pharmacy_id')->where('role', 'pharmacy_admin');
    }

    public function pharmacists()
    {
        return $this->hasMany(User::class, 'pharmacy_id')->where('role', 'pharmacist');
    }

    public function pharmacyProducts()
    {
        return $this->hasMany(PharmacyProduct::class, 'pharmacy_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'pharmacy_products', 'pharmacy_id', 'category_id')
            ->withPivot(['product_id', 'stock', 'selling_price', 'is_available'])
            ->withTimestamps();
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'pharmacy_id');
    }
}
