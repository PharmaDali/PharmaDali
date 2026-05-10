<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Forecast extends Model
{
    protected $fillable = [
        'kind',
        'granularity',
        'period',
        'period_start',
        'period_end',
        'ds',
        'tenant_id',
        'unique_id',
        'model_name',
        'forecast_value',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'ds' => 'date',
        'tenant_id' => 'integer',
        'forecast_value' => 'decimal:4',
    ];
}
