<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToPharmacy;

use App\Enums\CartStatus;

class Cart extends Model
{
    use BelongsToPharmacy;
    protected $fillable = [
        'customer_id',
        'pharmacy_id',
        'status',
    ];

    protected $casts = [
        'status' => CartStatus::class,
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}
