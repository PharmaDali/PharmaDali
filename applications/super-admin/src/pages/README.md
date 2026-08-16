# pages

Top-level route components. Each subfolder maps to one application route.

## Contents

| Folder | Route | Description |
|--------|-------|-------------|
| `Dashboard/` | `/` | Overview with stats, charts, and recent activity |
| `Users/` | `/users` | User listing, detail view, and management actions |
| `Settings/` | `/settings` | Application and account configuration |
| `Auth/` | `/login`, `/logout` | Authentication screens |
| `NotFound/` | `*` | 404 fallback page |

## Conventions

- Each page folder exports a default component and a lazy-loadable version for code splitting
- Pages compose components from `components/` and call hooks from `hooks/`
- No direct API calls inside page components — use hooks or the service layer
