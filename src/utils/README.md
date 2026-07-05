# utils

Pure utility functions with no React dependencies.

## Contents

| File | Description |
|------|-------------|
| `formatDate.ts` | Date formatting helpers (relative time, locale strings) |
| `formatNumber.ts` | Number formatting (currency, percentages, compact notation) |
| `validators.ts` | Common validation predicates (email, URL, non-empty, etc.) |
| `cn.ts` | `classnames`/`clsx` helper for conditional Tailwind class merging |
| `constants.ts` | Application-wide string/number constants |

## Conventions

- Every function must be pure (no side effects, no imports from React or services)
- Each utility should have a corresponding unit test in `__tests__/`
