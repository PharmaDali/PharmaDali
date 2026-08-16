# router

Application routing configuration.

## Contents

| File | Description |
|------|-------------|
| `index.tsx` | Root router definition (React Router or TanStack Router) |
| `routes.ts` | Typed route path constants to avoid magic strings |
| `PrivateRoute.tsx` | HOC/wrapper that redirects unauthenticated users to `/login` |
| `LazyRoute.tsx` | Utility wrapper for `React.lazy` + `Suspense` per route |

## Conventions

- All route paths are defined as constants in `routes.ts` — never hard-code path strings in components
- Protected routes are wrapped with `PrivateRoute`
- Each page is lazy-loaded to keep the initial bundle small
