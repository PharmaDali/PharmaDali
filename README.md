# PharmaDali

**PharmaDali** is a full-stack multi-tenant pharmacy management and retail ecosystem consisting of a Laravel 12 API backend, two React web administration portals, and two React Native (Expo) mobile applications for customers and pharmacists.

---

## Repository Structure

```
PharmaDali/
├── backend/                             # Laravel 12 REST API & WebSocket server
├── applications/
│   ├── pharmadali-admin/               # Pharmacy Admin & In-Store POS Portal (React + Vite)
│   ├── super-admin/                    # Multi-Tenant Platform Administration (React + Vite + TS)
│   ├── customer/                       # Customer Mobile App (React Native + Expo SDK 54)
│   └── pharmacist/                     # Pharmacist Fulfillment App (React Native + Expo SDK 54)
├── docs/                               # System architecture and technical specifications
├── deploy.sh                           # Production Docker deployment script
└── docker-compose.yml                  # Production container orchestration
```

---

## Applications Overview

### 1. Backend API (`backend/`)
- **Stack**: Laravel 12 (PHP 8.2+), MySQL 8.0, Redis 7, Meilisearch, Laravel Reverb (WebSockets).
- **Key Features**: Sanctum multi-guard auth, FEFO batch stock deduction, real-time Reverb broadcasting, restock prediction engine, Apriori recommendation service, and direct mobile APK streaming.
- **Guide**: [backend/README.md](backend/README.md)

### 2. Pharmacy Admin Portal (`applications/pharmadali-admin/`)
- **Stack**: React, Vite, Bootstrap 5, Laravel Echo.
- **Key Features**: In-store Point of Sale (POS), ESC/POS & WebUSB thermal receipt printing, FEFO inventory tracking, stock shortage & expiry alerts, and sales analytics.
- **Guide**: [applications/pharmadali-admin/README.md](applications/pharmadali-admin/README.md)

### 3. Super Admin Portal (`applications/super-admin/`)
- **Stack**: React, TypeScript, Vite, Tailwind CSS.
- **Key Features**: Platform-wide tenant management, pharmacy onboarding and verification, system-wide user moderation, and technical support ticketing.
- **Guide**: [applications/super-admin/README.md](applications/super-admin/README.md)

### 4. Customer Mobile App (`applications/customer/`)
- **Stack**: React Native, Expo SDK 54, Expo Router, NativeWind.
- **Key Features**: Product search & filtering, digital prescription upload, order placement (in-store pickup or delivery), live order status tracking, and push notifications.
- **Guide**: [applications/customer/README.md](applications/customer/README.md)

### 5. Pharmacist Mobile App (`applications/pharmacist/`)
- **Stack**: React Native, Expo SDK 54, Expo Router, NativeWind.
- **Key Features**: Pharmacist order fulfillment queue, prescription review & verification, pickup-ready alerts, and stock shortage notifications.
- **Guide**: [applications/pharmacist/README.md](applications/pharmacist/README.md)

---

## Quick Start Navigation

### 1. Start the Backend API
```bash
cd backend
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
*In separate terminals, run the background workers (or use `serve-lan.bat` for all-in-one LAN mode):*
```bash
# Terminal A (Queue Worker)
php artisan queue:work

# Terminal B (WebSocket Server)
php artisan reverb:start
```

### 2. Start the Pharmacy Admin Portal
```bash
cd applications/pharmadali-admin
npm install
npm run dev
```

### 3. Start the Super Admin Portal
```bash
cd applications/super-admin
npm install
npm run dev
```

### 4. Start the Mobile Apps
```bash
# Customer App
cd applications/customer
npm install
npx expo start

# Pharmacist App
cd applications/pharmacist
npm install
npx expo start
```

---

## Detailed System Documentation

For deep dives into algorithms and domain models, consult the [docs/](docs/README.md) directory:

- [System Architecture & Feature Overview](docs/README.md)
- [Restock Predictor Algorithm (WMA + EMA + ROP)](docs/RESTOCK_PREDICTOR.md)
- [Customer Recommendation Engine (Apriori Algorithm)](docs/CUSTOMER_RECOMMENDATION.md)
- [Backend API Setup](backend/README.md)
- [Pharmacy Admin Portal Setup](applications/pharmadali-admin/README.md)
- [Super Admin Platform Setup](applications/super-admin/README.md)
- [Customer Mobile App Setup](applications/customer/README.md)
- [Pharmacist Mobile App Setup](applications/pharmacist/README.md)