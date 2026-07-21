# PharmaDali Customer App Setup (Expo)

This folder contains the React Native Expo app for Customer 

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (optional globally, but helpful)
- Android Studio emulator or physical Android device with Expo Go
- Running backend API (see `../backend/README.md`)

## 1) Install dependencies

```bash
cd customer-mobile-app
npm install
```

## 2) Configure environment

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Set API URL in `.env`:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000/api
```

Important:
- Use your machine LAN IP for physical devices.
- Do not use `127.0.0.1` on physical devices (it points to the device itself).
- Variable name must start with `EXPO_PUBLIC_` to be available in app code.
- If you run backend with `php artisan serve` on port 8000, use:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:8000/api
```

How to get `<your-local-ip>` on Windows:

```bash
ipconfig
```

Use the `IPv4 Address` of your active network adapter.

After editing `.env`, fully restart Expo (`npm start`) so new env values are loaded.

## 3) Start development server

```bash
npx expo start
```

## Backend and Redis dependency

The mobile app depends on the backend API, and backend depends on Redis.

Run Redis in Docker (from any terminal):

```bash
docker run -d --name pharmadali-redis -p 6379:6379 redis:7-alpine
```

If the container already exists:

```bash
docker start pharmadali-redis
```

## Troubleshooting

- If API calls fail, verify `EXPO_PUBLIC_API_URL` and restart Expo.
- If auth/cart endpoints fail, confirm backend migrations are applied.
- If backend uses MySQL, verify DB connection in backend `.env` and check data in MySQL Workbench.
