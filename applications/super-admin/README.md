# PharmaDali Super Admin Portal (React + TypeScript + Vite)

The **PharmaDali Super Admin Portal** is the platform-level administration dashboard designed for system operators and platform managers. It provides centralized control over all pharmacy tenants, branch registrations, user role moderation, real-time platform broadcasts, and technical support ticketing.

---

## Prerequisites

- **Node.js 18+** and npm
- **Backend API**: Running Laravel API server (see [`backend/README.md`](../../backend/README.md))

---

## 1. Installation

```bash
cd applications/super-admin
npm install
```

---

## 2. Environment Configuration

Create or update `.env`:

```env
# Backend API Base URL (must include /api)
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Real-Time WebSocket Connection (Laravel Reverb)
VITE_REVERB_APP_KEY=pharmadali-app-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
```

> [!NOTE]
> In production, configure with your production domains:
> ```env
> VITE_API_BASE_URL=https://api.pharmadali.com/api
> VITE_REVERB_APP_KEY=pharmadali-app-key
> VITE_REVERB_HOST=ws.pharmadali.com
> VITE_REVERB_PORT=443
> ```

---

## 3. Development Server

```bash
npm run dev
```

Open the displayed URL in your browser (typically `http://localhost:5174`).

---

## 4. Key Functional Areas

- **Pharmacy Tenant Management (`/pharmacies`)**: Review, verify, approve, or suspend pharmacy branch registrations across the platform.
- **User Administration (`/users`)**: Search, filter, inspect, and moderate all platform accounts across all roles (`customer`, `pharmacist`, `pharmacy_admin`, `super_admin`).
- **Support Ticketing (`/tickets`)**: Review support tickets submitted by pharmacy managers and customers, update resolution statuses, and respond to inquiries.
- **System-Wide Alerts & Notifications (`/notifications`)**: Broadcast emergency announcements, scheduled maintenance notices, and system alerts to all connected pharmacies and staff via Laravel Reverb.
- **Platform Analytics (`/`)**: High-level platform health metrics, active tenant counts, aggregate transaction volumes, and user growth statistics.

---

## 5. Build for Production

```bash
# Type-check with TypeScript and build bundle
npm run build

# Preview production build locally
npm run preview
```

The compiled assets are generated into `dist/` ready to be served by Nginx or containerized via Docker.
