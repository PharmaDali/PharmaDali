<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('inventory:check-alerts')->dailyAt('02:00');
Schedule::command('orders:expire')->everyMinute();
Schedule::command('analytics:refresh-insights')->dailyAt('23:00')->timezone('Asia/Manila');
