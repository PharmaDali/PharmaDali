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

### `customer-mobile-app/`
React Native + Expo mobile application.

- Supports customer app flows.
- Uses role-based app config and environment-driven API URL.

Read setup guide: [customer-mobile-app/README.md](customer-mobile-app/README.md)


### `pharmacist-mobile-app/`
React Native + Expo mobile application.

- Supports pharmacist app flows.
- Uses role-based app config and environment-driven API URL.

Read setup guide: [pharmacist-mobile-app/README.md](pharmacist-mobile-app/README.md)

## Setup Navigation

From the project root, change directory into the app you want to set up, then follow that folder's README.

```bash
cd backend
# Read and follow backend/README.md

cd ..\ai-service
# Read and follow ai-service/README.md

cd ..\pharmadali-admin
# Read and follow pharmadali-admin/README.md

cd ..\customer-mobile-app
# Read and follow customer-mobile-app/README.md

cd ..\pharmacist-mobile-app
# Read and follow pharmacist-mobile-app/README.md
```

This root README is intentionally a high-level guide only.