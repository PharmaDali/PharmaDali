# PharmaDali Pharmacy Admin & POS Portal (React + Vite)

The **PharmaDali Pharmacy Admin Portal** is a web application built with **React**, **Vite**, and **Bootstrap 5** for pharmacy managers, branch administrators, and cashiers. It houses the in-store Point of Sale (POS) system, FEFO batch inventory tracking, thermal printing hardware integration, restock forecasting analytics, and real-time WebSocket alerts.

---

## Prerequisites

- **Node.js 18+** and npm
- **Backend API**: Running Laravel API server (see [`backend/README.md`](../../backend/README.md))
- **Laravel Reverb**: Real-time WebSocket server running on port `8080` (or `443` in production)

---

## 1. Installation

```bash
cd applications/pharmadali-admin
npm install
```

---

## 2. Environment Configuration

Create or update `.env` based on `.env.example`:

```bash
copy .env.example .env
```

Configure your environment settings:

```env
# Backend API Base URL (must include /api)
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Laravel Reverb WebSocket Connection
VITE_REVERB_APP_KEY=pharmadali-app-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
```

> [!NOTE]
> - Always include `/api` at the end of `VITE_API_BASE_URL`.
> - In production, set `VITE_REVERB_HOST=ws.pharmadali.com` and `VITE_REVERB_PORT=443`.
> - Restart `npm run dev` after modifying `.env` so Vite loads the new values.

---

## 3. Development Server

```bash
npm run dev
```

Open your browser to the URL displayed in the terminal (typically `http://localhost:5173`).

---

## 4. Key Functional Modules

### A. Point of Sale (POS) & Hardware Integration
- **Fast Cashier Checkout**: Barcode scanning, item lookup, customer discount handling, and change calculation.
- **In-Store Pickup Verification**: Complete and hand over pre-ordered customer pickups.
- **Thermal Receipt Printing**: Built-in WebUSB and ESC/POS thermal printer support for automatic 58mm/80mm receipt generation.

### B. FEFO Batch Inventory Management
- **Batch Tracking**: Record manufacturing and expiry dates per batch (`ProductBatch`).
- **Bulk CSV Import**: Import product catalogs and batch stock using the CSV import utility (`php artisan pharmacy:import-csv`).
- **Stock Audit Logs**: Real-time observation of stock deductions adhering strictly to the First-Expiry, First-Out rule.

### C. Restock Prediction & Shortage Analytics
- Dynamic forecast badges identifying products running out of stock within $\le 7$ days based on Average Daily Sales (ADS) and Reorder Point (ROP).
- Categorized notification tabs: **Primary**, **Stocks**, **Expiring**, and **Alerts**.

---

## 5. Build for Production

```bash
# Type-check and bundle assets
npm run build

# Preview the production build locally
npm run preview
```

The production output is placed in the `dist/` directory, ready to be served by Nginx or uploaded to a static host.
