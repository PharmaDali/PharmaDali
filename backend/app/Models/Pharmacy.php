<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pharmacy extends Model
{
    use SoftDeletes;

    protected $table = 'pharmacies';

    protected $fillable = [
        'pharmacy_name',
        'location',
        'contact_number',
        'is_active',
    ];

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
