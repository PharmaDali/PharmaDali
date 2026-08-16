# types

Shared TypeScript type definitions and interfaces used across the app.

## Contents

| File | Description |
|------|-------------|
| `user.ts` | `User`, `UserRole`, `UserStatus` types |
| `api.ts` | Generic API response/error envelope types |
| `auth.ts` | `AuthState`, `LoginPayload`, `TokenPair` types |
| `common.ts` | Utility types: `Nullable<T>`, `Optional<T>`, `ID`, etc. |

## Conventions

- Types and interfaces only — no runtime code in this folder
- Use `interface` for object shapes that may be extended; use `type` for unions and mapped types
- Import from `@/types/<file>` — avoid deep relative imports
