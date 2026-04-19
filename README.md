# PharmaDali

PharmaDali is a full-stack multi-tenant pharmacy platform composed of a Laravel backend API, a React admin dashboard, and a React Native Expo mobile app for customer and pharmacist workflows.

## Main Folders

### `backend/`
Laravel 12 API and business logic.

- Handles authentication, orders, cart, and pharmacy domain endpoints.
- Connects to MySQL for persistent data.
- Uses Redis (commonly run via Docker) for caching/session-related features.

Read setup guide: [backend/README.md](backend/README.md)

### `pharmadali-admin/`
React + Vite admin web application.

- Provides admin-facing UI and dashboard features.
- Calls backend API through environment-based base URL.

Read setup guide: [pharmadali-admin/README.md](pharmadali-admin/README.md)

### `pharmadali-mobile-app/`
React Native + Expo mobile application.

- Supports both customer and pharmacist app flows.
- Uses role-based app config and environment-driven API URL.

Read setup guide: [pharmadali-mobile-app/README.md](pharmadali-mobile-app/README.md)

## Setup Navigation

From the project root, change directory into the app you want to set up, then follow that folder's README.

```bash
cd backend
# Read and follow backend/README.md

cd ..\pharmadali-admin
# Read and follow pharmadali-admin/README.md

cd ..\pharmadali-mobile-app
# Read and follow pharmadali-mobile-app/README.md
```

This root README is intentionally a high-level guide only.