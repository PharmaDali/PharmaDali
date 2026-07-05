# Super Admin

A React + TypeScript + Vite admin dashboard application.

## Project Structure

```
super-admin/
├── public/             Static files served as-is (favicon, robots.txt, etc.)
├── src/                Application source — see src/README.md for full breakdown
│   ├── assets/         Images, icons, and fonts
│   ├── components/     Reusable UI components (common, layout, ui)
│   ├── hooks/          Custom React hooks
│   ├── pages/          Route-level page components
│   ├── router/         Routing config and protected route wrappers
│   ├── services/       API and external-service modules
│   ├── store/          Global state management
│   ├── styles/         Global CSS and design tokens
│   ├── types/          Shared TypeScript type definitions
│   ├── utils/          Pure utility/helper functions
│   ├── App.tsx         Root application component
│   └── main.tsx        Application entry point
├── index.html          HTML shell
├── vite.config.ts      Vite configuration
├── tsconfig.json       TypeScript project references
└── eslint.config.js    ESLint flat configuration
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check + build for production
npm run build

# Preview the production build
npm run preview
```

---

> This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
