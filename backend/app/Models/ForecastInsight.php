<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToTenant;

class ForecastInsight extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'pharmacy_id',
        'week_start',
        'demand_granularity',
        'sales_granularity',
        'model',
        'demand',
        'sales',
        'source_hash',
    ];

    protected $casts = [
        'pharmacy_id' => 'integer',
        'week_start' => 'date',
    ];
}
