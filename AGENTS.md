# PharmaDali — Repository Guidelines, Architecture Context & System Rules

## 1. Project Overview & Multi-App Tech Stack

PharmaDali is a full-stack multi-tenant pharmacy management and retail ecosystem consisting of three primary applications:

1. **Backend API (`/backend`)**
   - **Framework**: Laravel 12 (PHP 8.2+) with Sanctum API token authentication.
   - **Real-Time Transport**: Laravel Reverb WebSockets (`ws://127.0.0.1:8080`).
   - **Database & Storage**: MySQL database, Eloquent ORM, Repository Pattern, Redis/File caching.
   - **Command Line**: Artisan console commands (e.g. `php artisan inventory:check-alerts`).

2. **Pharmacy Admin Portal (`/applications/pharmadali-admin`)**
   - **Framework**: React (Vite), React Router DOM v6.
   - **Styling**: Bootstrap 5 + PharmaDali brand CSS design system (`--pd-primary: #2aabe2`, `--pd-bg-main: #e8f0fe`).
   - **Real-Time Integration**: Laravel Echo + `pusher-js` with dynamic bearer token authorization.

3. **Pharmacist Mobile App (`/applications/pharmacist-mobile-app`)**
   - **Framework**: React Native / Expo mobile application for pharmacists.
   - **Core Functions**: Real-time order fulfillment, customer consultation chat, prescription review, profile management.

---

## 2. Core Functional Modules & Domain Architecture

### A. Point of Sale (POS) & Order Management
- **POS Operations** (`/pos/products`, `/pos/orders`): Handles over-the-counter transactions, receipt generation, and in-store pickup order completion (`/pos/pickup-orders/{order}/complete`).
- **Customer Orders & Prescriptions**: Customer order pipeline supporting online delivery and in-store pickup. Includes prescription image upload (`/customer/order-items/{id}/prescription`) and pharmacist verification.
- **Order Lifecycle States**: `pending` ➔ `pickup_ready` ➔ `completed` (or `cancelled` / `overdue`).

### B. Inventory & FEFO Batch Management
- **FEFO Algorithm (First Expiry, First Out)**: Stock deduction (`ProductBatchRepository::stockOutFefo`) consumes batch inventory ordered by earliest `expiry_date`. Non-expiring batches are consumed last.
- **Stock Synchronization Rule**: Modifying batch stock calls `syncPharmacyProductStock()`.
- **CRITICAL ELOQUENT RULE**: All stock updates MUST instantiate the `PharmacyProduct` model and execute `$pharmacyProduct->save()` (NEVER raw SQL `PharmacyProduct::where(...)->update(...)`) so Eloquent observer events (`PharmacyProductObserver`) fire reliably across all app actions.

### C. Restock Prediction & Shortage Forecasting Algorithm
- **Algorithm** (`RestockPredictor.php`):
  - **Average Daily Sales (ADS)**: Calculated over order sales history.
  - **Reorder Point (ROP)**: Formula `(ADS * LeadTimeDays) + MinSafetyStock`.
  - **Days of Stock (DOS)**: Formula `CurrentStock / ADS`.
- **Shortage Criteria**: Products with `DOS <= 7` days of remaining supply OR `stock <= ROP` are flagged as priority restocks.
- **Caching Strategy** (`RestockPredictorService.php`): Multi-limit cache keys (`pharmacy_{id}_priority_restocks_{limit}`) with explicit invalidation (`clearPriorityRestocksCache`).

### D. Analytics & Recommendation Engine
- **Apriori Algorithm**: Analyzes multi-item customer order patterns to generate market basket association rules (`/pharmacy/analytics/apriori`).
- **Customer Recommendations**: Powers smart product cross-selling recommendations on customer endpoints (`/customer/recommendations/hero`).

---

## 3. Real-Time Broadcasting & Notification System

### A. WebSocket & Auth Protocol
- **Channel**: Private channel `private-App.Models.User.{id}` listened to via Laravel Reverb.
- **Authorizer Callback**: Frontend `useNotifications.js` uses a custom `authorizer` callback in Laravel Echo to dynamically fetch `localStorage.getItem("token")` on every connection attempt.
- **Channel Route** (`backend/routes/channels.php`):
  ```php
  Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
      return (int) $user->id === (int) $id;
  });
  ```

### B. Notification Categories & UI Classification
Admin notifications are classified into 4 core UI tabs:
- 🌟 **Primary** (All notifications)
- 📦 **Stocks** (Combines static `Low Stocks` threshold $\le 50$ units AND `Shortage Alert` predicted stockouts $\le 7$ days with estimated remaining supply duration)
- ⏳ **Expiring** (`Expiry Warning` batches expiring within 30 days)
- 🛡️ **Alerts** (`System Alert` administrative and system notices)

### C. Observer & Duplicate Prevention Rules
- **Recipient Targeting**: Real-time stock alerts target all pharmacy staff and admin roles (`whereIn('role', ['pharmacy_admin', 'pharmacist', 'admin', 'system_admin'])`).
- **Duplicate Prevention**: `CheckInventoryAlerts` and `PharmacyProductObserver` check `$admin->notifications` (both read & unread) natively in PHP using `->contains(...)` to prevent duplicate alert creation.
- **Read Status Preservation**: Marking a notification as **Read** updates `read_at` in state and DB. It does **NOT** delete or hide the notification from the list view. Items are only deleted upon explicit user click (`deleteNotification`).

---

## 4. Frontend UI/UX Standards

- **Brand System**: Use official PharmaDali colors (`--pd-primary`: `#2aabe2`, `--pd-bg-main`: `#e8f0fe`) and standard Bootstrap 5 components (`nav nav-pills`, `badge`, `card shadow-sm`).
- **Icon Standards**: Use valid FontAwesome 6 Solid icon classes (`fa-solid`) for all category icons (`fa-boxes-stacked`, `fa-clock`, `fa-triangle-exclamation`, `fa-circle-info`, `fa-star`, `fa-circle-check`, `fa-trash-can`). Avoid `fa-regular` for unsupported icons.
- **Toast Notifications**: Floating toast popups (`ToastNotification.jsx`) must display clean, non-technical headlines (e.g. *"Stock Alert"*, *"Product Expiry Notice"*, *"System Alert"*) without exposing technical PHP class paths or raw internal keys.

---

## 5. Development & Git Workflow Rules

- **Git Commit Policy**: NEVER execute `git commit` without explicit permission from the user.
- **API Response Format**: REST APIs return standard JSON structures with proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `422 Unprocessable Entity`).
- **Sanctum Abilities**: Enforce Sanctum ability tokens (`ability:customer`, `ability:pharmacist`, `ability:pharmacy_admin`, `ability:super_admin`) on protected route groups.
