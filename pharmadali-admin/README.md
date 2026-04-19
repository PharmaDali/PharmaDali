# PharmaDali Admin Setup (React + Vite)

This folder contains the admin dashboard web app.

## Prerequisites

- Node.js 18+ and npm
- Running backend API (see `../backend/README.md`)

## 1) Install dependencies

```bash
cd pharmadali-admin
npm install
```

## 2) Configure environment

Create `.env` in this folder.

If `.env.example` exists, copy it first:

```bash
copy .env.example .env
```

If there is no `.env.example`, create `.env` manually and add:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

If your backend is started using `serve-lan.bat`, use:

```env
VITE_API_BASE_URL=http://<your-local-ip>:3000/api
```

How to get `<your-local-ip>` on Windows:

```bash
ipconfig
```

Use the `IPv4 Address` of your active network adapter.

Important `.env` notes:

- Variable name must be exactly `VITE_API_BASE_URL`.
- Include `/api` at the end of the URL.
- Restart `npm run dev` after changing `.env` so Vite reloads env values.

## 3) Run the app

```bash
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

## Build and preview

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Notes

- This app sends requests to the backend base URL from `VITE_API_BASE_URL`.
- Keep `/api` in the base URL because API routes are under that prefix.
