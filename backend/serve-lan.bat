@echo off
title PharmaDali LAN Server ^& Background Services
echo ========================================================
echo   Starting PharmaDali LAN Server ^& Background Services...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Laravel Reverb WebSockets (ws://127.0.0.1:8080)...
start "PharmaDali - Reverb WebSockets" cmd /k "cd /d "%~dp0" && php artisan reverb:start"

echo [2/3] Starting Laravel Queue Worker...
start "PharmaDali - Queue Worker" cmd /k "cd /d "%~dp0" && php artisan queue:work --tries=3"

echo [3/3] Starting Laravel Task Scheduler (Auto-Expire Orders ^& Alerts)...
start "PharmaDali - Task Scheduler" cmd /k "cd /d "%~dp0" && php artisan schedule:work"

echo.
echo Starting LAN HTTP Server on port 3000...
cd /d "%~dp0public"
php -S 0.0.0.0:3000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php
