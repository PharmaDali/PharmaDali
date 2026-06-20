# Backend Setup (Laravel API)

This folder contains the Laravel backend API for PharmaDali.

## Prerequisites

- PHP 8.2+
- Composer 2+
- Node.js 18+ and npm
- Docker Desktop (for Redis)
- MySQL Server (local or containerized)
- MySQL Workbench (GUI)

## 1) Install dependencies

```bash
cd backend
composer install
npm install
```

## 2) Configure environment

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Generate app key:

```bash
php artisan key:generate
```

Update these `.env` values for MySQL and Redis:

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmadali
DB_USERNAME=root
DB_PASSWORD=

REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
```

## 3) Start Redis with Docker

Run Redis in Docker:

```bash
docker run -d --name pharmadali-redis -p 6379:6379 redis:7-alpine
```

If you already created the container before:

```bash
docker start pharmadali-redis
```

## 4) Create database in MySQL Workbench

1. Open MySQL Workbench and connect to your MySQL server.
2. Create schema `pharmadali`.
3. Confirm connection settings match the `.env` values.

## 5) Run migrations and seeders

```bash
php artisan migrate
php artisan db:seed
```

## 6) Run the backend

Use Laravel built-in server:

```bash
php artisan serve
```

Default URL: `http://127.0.0.1:8000`

Optional LAN mode (for mobile testing):

```bash
serve-lan.bat
```

LAN mode runs on `http://<your-local-ip>:3000`

## IDE Setup
For instructions on setting up your IDE (VS Code / PHP Tools / Intelephense) and resolving false-positive linter warnings, see the [IDE Setup Guide](IDE_SETUP.md).

