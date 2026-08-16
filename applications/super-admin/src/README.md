# src

Application source code root.

## Folder Structure

```
src/
├── assets/         Static assets (images, icons, fonts)
├── components/     Reusable UI components
│   ├── common/     Generic components (Button, Input, Modal…)
│   ├── layout/     Page-frame components (Header, Sidebar, Footer…)
│   └── ui/         Design-system primitives (Card, Avatar, Tooltip…)
├── hooks/          Custom React hooks
├── pages/          Route-level page components
├── router/         Routing configuration and protected route wrappers
├── services/       API and external-service modules
├── store/          Global state management
├── styles/         Global CSS and design tokens
├── types/          Shared TypeScript type definitions
├── utils/          Pure utility/helper functions
├── App.tsx         Root application component
├── App.css         Root component styles
├── main.tsx        Application entry point (ReactDOM.createRoot)
└── index.css       Global style entry point
```

Each subfolder contains its own `README.md` with detailed contents and conventions.
