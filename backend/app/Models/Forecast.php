<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToTenant;

class Forecast extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'kind',
        'granularity',
        'period',
        'period_start',
        'period_end',
        'ds',
        'pharmacy_id',
        'unique_id',
        'model_name',
        'forecast_value',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'ds' => 'date',
        'pharmacy_id' => 'integer',
        'forecast_value' => 'decimal:4',
    ];
}
