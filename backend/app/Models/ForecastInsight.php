<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForecastInsight extends Model
{
    protected $fillable = [
        'tenant_id',
        'week_start',
        'demand_granularity',
        'sales_granularity',
        'model',
        'demand',
        'sales',
        'source_hash',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'week_start' => 'date',
    ];
}
