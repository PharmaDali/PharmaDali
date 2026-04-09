@echo off
cd /d "%~dp0public"
php -S 0.0.0.0:3000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php
