# components

Reusable UI components shared across the application.

## Contents

- `common/` — Generic, application-agnostic components (Button, Input, Modal, Spinner, etc.)
- `layout/` — Structural components that define page layout (Header, Sidebar, Footer, PageWrapper, etc.)
- `ui/` — Design-system-level primitives such as Card, Badge, Avatar, Tooltip, etc.

## Conventions

- Each component lives in its own folder: `components/common/Button/Button.tsx`
- Export via an `index.ts` barrel file inside each component folder
- Co-locate component-specific styles and tests with the component file
