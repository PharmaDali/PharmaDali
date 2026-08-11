<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemExchange extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_number',
        'order_id',
        'pharmacy_id',
        'processed_by',
        'total_returned_value',
        'total_replacement_value',
        'additional_payment',
        'payment_method',
        'amount_received',
        'change_amount',
        'reason',
        'notes',
    ];

    protected $casts = [
        'total_returned_value' => 'decimal:2',
        'total_replacement_value' => 'decimal:2',
        'additional_payment' => 'decimal:2',
        'amount_received' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function returnedItems()
    {
        return $this->hasMany(ExchangeReturnedItem::class, 'item_exchange_id');
    }

    public function replacementItems()
    {
        return $this->hasMany(ExchangeReplacementItem::class, 'item_exchange_id');
    }
}
