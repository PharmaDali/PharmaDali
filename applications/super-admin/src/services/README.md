# services

Modules responsible for all external communication (HTTP, WebSocket, etc.).

## Contents

| File / Folder | Description |
|---------------|-------------|
| `api/` | Base Axios/fetch client with interceptors for auth headers and error handling |
| `authService.ts` | Login, logout, token refresh, and session validation |
| `userService.ts` | CRUD operations for user resources |
| `settingsService.ts` | Fetch and persist application-wide settings |

## Conventions

- Services are plain TypeScript modules — no React imports
- All functions are `async` and return typed results
- Error handling is done in the service layer; components receive clean data or thrown errors
