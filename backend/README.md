# PharmaDali Backend Setup (Laravel 12 API)

The **PharmaDali Backend** is a multi-tenant REST API built on **Laravel 12 (PHP 8.2+)**. It coordinates business logic across all apps, including authentication via Sanctum, FEFO inventory allocation, real-time WebSocket broadcasting via Laravel Reverb, product search indexing via Meilisearch, restock predictions, and direct mobile APK distribution.

---

## Prerequisites

- **PHP 8.2+** (with `pdo_mysql`, `mbstring`, `openssl`, `curl`, `redis`, `gd`, `zip` extensions)
- **Composer 2+**
- **Node.js 18+** and npm
- **MySQL Server 8.0+**
- **Docker Desktop** (used to run Redis and Meilisearch locally)

---

## 1. Installation

```bash
cd backend
composer install
npm install
```

---

## 2. Environment Configuration

Copy the example environment file:
```bash
copy .env.example .env
```

Generate the application encryption key:
```bash
php artisan key:generate
```

Update your `.env` with your database and infrastructure settings:

```env
APP_NAME=PharmaDali
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmadali
DB_USERNAME=root
DB_PASSWORD=

# Redis (Cache, Sessions, Queues)
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# Meilisearch (Product Search)
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=pharmadali_master_key

# Laravel Reverb (Real-Time WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=pharmadali-app-id
REVERB_APP_KEY=pharmadali-app-key
REVERB_APP_SECRET=pharmadali-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

## 3. Start Local Supporting Services via Docker

Run Redis and Meilisearch containers for local development:

```bash
# Redis
docker run -d --name pharmadali-redis -p 6379:6379 redis:7-alpine

# Meilisearch
docker run -d --name pharmadali-meilisearch -p 7700:7700 -e MEILI_MASTER_KEY=pharmadali_master_key getmeili/meilisearch:v1.12
```

*(If containers already exist, start them using `docker start pharmadali-redis pharmadali-meilisearch`).*

---

## 4. Database Setup & Indexing

1. Ensure your MySQL server has a schema named `pharmadali`.
2. Run database migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
3. Sync search settings and import products into Meilisearch:
   ```bash
   php artisan scout:sync-index-settings
   php artisan scout:import "App\Models\PharmacyProduct"
   ```

---

## 5. Running the Backend & Services

### Option A: All-in-One LAN Mode (Recommended for Mobile Device Testing)
Launches the HTTP API server on `http://0.0.0.0:3000`, Laravel Reverb WebSockets, Queue Worker, and Task Scheduler all at once:

```cmd
serve-lan.bat
```

### Option B: Individual Terminal Services
If you prefer running services individually across separate terminal tabs:

#### Terminal 1: Laravel Web Server
```bash
php artisan serve
```
*Accessible at `http://127.0.0.1:8000`.*

#### Terminal 2: Queue Worker
Processes asynchronous jobs, event broadcasting, and push notification delivery:
```bash
php artisan queue:work --tries=3
```

#### Terminal 3: Laravel Reverb WebSocket Server
Powers the WebSocket gateway (`ws://127.0.0.1:8080`):
```bash
php artisan reverb:start
```

---

## 6. Console Commands & Utilities

- **Check Stock & Expiry Alerts**: Scans inventory for items expiring within 30 days or falling below their Reorder Point (ROP) and broadcasts notifications:
  ```bash
  php artisan inventory:check-alerts
  ```
- **Sync Product Stock**: Recomputes all total inventory counters from batch records:
  ```bash
  php artisan inventory:sync-product-stocks
  ```

---

## 7. Mobile APK Download Endpoints

The backend hosts and streams the pre-compiled Android applications directly:
- `GET /download/customer-app` (or `/downloads/customer-app`): Streams `public/downloads/pharmadali-customer.apk`
- `GET /download/pharmacist-app` (or `/downloads/pharmacist-app`): Streams `public/downloads/pharmadali-pharmacist.apk`

---

## 8. IDE Setup Guide

To configure VS Code / PHP Tools / Intelephense and resolve IDE false positives for Laravel magic methods, refer to the [IDE Setup Guide](IDE_SETUP.md).
