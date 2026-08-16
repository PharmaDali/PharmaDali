# hooks

Custom React hooks that encapsulate stateful logic and side effects.

## Contents

| Hook | Description |
|------|-------------|
| `useAuth.ts` | Read and manage the current user session |
| `useDebounce.ts` | Debounce a rapidly-changing value |
| `usePagination.ts` | Pagination state (page, pageSize, totalPages) |
| `useLocalStorage.ts` | Synchronised read/write to `localStorage` |
| `useMediaQuery.ts` | Reactive CSS media-query matching |

## Conventions

- File names follow the `use<Name>.ts` pattern
- Each hook is framework-only (no direct DOM manipulation unless necessary)
- Hooks that fetch data should accept an optional `enabled` flag to support conditional fetching
