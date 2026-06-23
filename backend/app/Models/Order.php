<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Concerns\BelongsToPharmacy;

class Order extends Model
{
    use HasFactory, BelongsToPharmacy;

    protected $fillable = [
        'order_number',
        'customer_id',
        'pharmacy_id',
        'status',
        'verified_by',
        'verified_at',
        'payment_method',
        'payment_status',
        'subtotal',
        'discount_amount',
        'total_amount',
        'amount_received',
        'change_amount',
        'scheduled_pickup_at',
        'picked_up_at',
        'note',
        'placed_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_received' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'scheduled_pickup_at' => 'datetime',
        'verified_at' => 'datetime',
        'placed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }
}
