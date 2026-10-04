# PharmaDali — System Architecture & Feature Documentation

This document provides a comprehensive architectural breakdown of the **PharmaDali** platform, a multi-tenant pharmacy management and retail ecosystem consisting of five core applications and integrated background services.

---

## 1. Platform Overview & System Map

```
                             ┌───────────────────────────────────────┐
                             │          PharmaDali Platform          │
                             └──────────────────┬────────────────────┘
                                                │
         ┌───────────────────┬──────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                  ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐
│   Backend API   │ │  Admin Portal   │ │  Super Admin   │ │ Customer Mobile│ │Pharmacist Mobile│
│  (Laravel 12)   │ │  (React + Vite) │ │  (React + TS)  │ │ (React Native) │ │ (React Native)  │
└────────┬────────┘ └────────┬────────┘ └────────┬───────┘ └────────┬───────┘ └────────┬────────┘
         │                   │                   │                  │                  │
         │ REST API & Sanctum│ WebSockets (Echo) │ Multi-Tenant Mgt │ Order & Catalog  │ Fulfillment & Rx
         ▼                   ▼                   ▼                  ▼                  ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│               Infrastructure: MySQL 8.0 · Redis 7 · Meilisearch · Laravel Reverb              │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Applications

| Component | Repository Path | Tech Stack | Role |
| :--- | :--- | :--- | :--- |
| **Backend API** | [`backend/`](../backend/) | Laravel 12, PHP 8.2+, Sanctum | Multi-tenant REST API, domain business logic, queue worker, Reverb WebSocket server |
| **Pharmacy Admin Portal** | [`applications/pharmadali-admin/`](../applications/pharmadali-admin/) | React, Vite, Bootstrap 5 | In-store POS (Point of Sale), thermal printing, inventory management, sales reports, live notifications |
| **Super Admin Portal** | [`applications/super-admin/`](../applications/super-admin/) | React, TypeScript, Vite | Platform oversight, pharmacy tenant onboarding, system-wide user moderation, support ticket resolution |
| **Customer Mobile App** | [`applications/customer/`](../applications/customer/) | React Native, Expo SDK 54, NativeWind | Store browsing, prescription image upload, checkout (in-store pickup or delivery), push notifications |
| **Pharmacist Mobile App** | [`applications/pharmacist/`](../applications/pharmacist/) | React Native, Expo SDK 54, NativeWind | Mobile order fulfillment, prescription verification, ready-for-pickup notifications, shortage alerts |

---

## 2. Core Functional Modules & Domain Architecture

### A. Point of Sale (POS) & Thermal Printer Integration
- **Direct Checkout**: Handles OTC (over-the-counter) and walk-in sales with live inventory deductions.
- **In-Store Pickup Completion**: Validates online customer orders at pickup counters (`/pos/pickup-orders/{order}/complete`).
- **Hardware Integration**: Built-in support for WebUSB and ESC/POS thermal receipt printers for immediate physical receipt printing upon sale finalization.

### B. FEFO (First Expiry, First Out) Batch Inventory Management
- **Automatic Expiry Tracking**: When an order or POS sale occurs, inventory is consumed from batches sorted strictly by earliest `expiry_date` via `ProductBatchRepository::stockOutFefo()`. Non-expiring items are consumed last.
- **Stock Synchronization**: Any batch adjustment recalculates and updates total parent product stock via `syncPharmacyProductStock()`.
- **Eloquent Observer Guarantee**: All modifications trigger `PharmacyProductObserver` and `ProductBatchObserver` to recalculate metrics and fire real-time Reverb alerts.

### C. Restock Prediction & Shortage Forecasting
- **Weighted Moving Average (WMA)**: Calculates Average Daily Sales (ADS) weighting recent 7-day velocity (60%) and 30-day baseline (40%).
- **Adaptive Lead Time**: Automatically learns supplier delivery speeds using Exponential Moving Average (EMA).
- **Dynamic Reorder Point (ROP)**: Formula:
  $$\text{ROP} = (\text{Average Daily Sales} \times \text{Adaptive Lead Time}) + \text{Safety Stock}$$
- **Days of Stock (DOS)**:
  $$\text{DOS} = \frac{\text{Current Stock}}{\text{Average Daily Sales}}$$
- **Shortage Alerting**: Products with $\text{DOS} \le 7\text{ days}$ or $\text{Stock} \le \text{ROP}$ trigger high-priority alerts across admin and pharmacist channels.
- *Detailed specification*: [RESTOCK_PREDICTOR.md](RESTOCK_PREDICTOR.md)

### D. Intelligent Product Recommendations (Apriori Algorithm)
- **Market Basket Analysis**: Analyzes co-occurrence patterns in customer checkouts to calculate support and confidence for product associations.
- **Cold-Start Safety Protocol**:
  - New users with no purchase history receive safe wellness and dietary supplement recommendations (vitamins, immunity boosters).
  - Sensitive pharmaceuticals (antibiotics, injectables, prescription medications) are strictly excluded from automated recommendations for unverified customers.
- *Detailed specification*: [CUSTOMER_RECOMMENDATION.md](CUSTOMER_RECOMMENDATION.md)

### E. Real-Time WebSockets & Notifications
- **Laravel Reverb**: Real-time WebSocket server running on `ws://127.0.0.1:8080` (or `wss://ws.pharmadali.com` in production).
- **Private Channel Security**: User channels (`private-App.Models.User.{id}`) authenticated via Sanctum Bearer tokens.
- **Universal Dual-Driver**: 100% of notification classes return `['database', 'broadcast']` in their `via()` method for instant delivery and persistent notification history.
- **Stock & Expiry Alerts**: Automatically computed with remaining supply forecasts (e.g. *"Will last less than 4 days"*).

---

## 3. Mobile Applications & Build Architecture

Both mobile applications are built on **Expo SDK 54 / React Native 0.81**:

### Mobile App Icons & Adaptive Safe Zones
- **Adaptive Icon Standard**: Android adaptive icons place the brand emblem within a 66dp circular safe zone on a 108dp canvas with transparent foreground and `#ffffff` background.
- **Uncropped Guarantee**: Master vector emblems are pre-rendered at 1024×1024 and pre-compiled into all Android densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) to ensure 0% cropping on any launcher mask (circle, squircle, teardrop).

### Build & Release Channels
- **Standalone APKs**: Generated via EAS Build (`preview` profile) or local Gradle (`assembleDebug` / `assembleRelease`).
- **Direct Server Downloads**: Pre-built APKs are hosted on the backend server and streamed through:
  - `GET /download/customer-app`
  - `GET /download/pharmacist-app`
- **Over-The-Air (OTA) Updates**: EAS Update enables pushing immediate bug fixes and UI updates to user phones over the air without requiring a full APK reinstall:
  ```bash
  eas update --channel preview --message "Bug fix description"
  ```

---

## 4. Documentation Index

| Guide | Description |
| :--- | :--- |
| **[Restock Predictor](RESTOCK_PREDICTOR.md)** | Formula, mathematical models, and caching strategy for inventory forecasting |
| **[Customer Recommendations](CUSTOMER_RECOMMENDATION.md)** | Apriori market basket analysis and cold-start patient safety rules |
| **[Backend Setup](../backend/README.md)** | Local development environment setup for Laravel 12 API |
| **[Admin Portal Setup](../applications/pharmadali-admin/README.md)** | Setup and configuration for the Pharmacy Admin portal |
| **[Super Admin Setup](../applications/super-admin/README.md)** | Setup and configuration for the Super Admin platform management portal |
| **[Customer App Setup](../applications/customer/README.md)** | Setup and development guide for the Customer Mobile App |
| **[Pharmacist App Setup](../applications/pharmacist/README.md)** | Setup and development guide for the Pharmacist Mobile App |
