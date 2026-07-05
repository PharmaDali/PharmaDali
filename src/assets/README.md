# assets

Static assets bundled by Vite.

## Contents

| Folder / File | Description |
|---------------|-------------|
| `images/` | Raster images (`.png`, `.jpg`, `.webp`) — product screenshots, hero artwork |
| `icons/` | SVG icon files used outside of an icon-font system |
| `fonts/` | Self-hosted web font files (`.woff2`, `.woff`) |
| `react.svg` | React logo (default Vite scaffold) |
| `vite.svg` | Vite logo (default Vite scaffold) |

## Conventions

- Optimise images before committing (use `squoosh` or similar)
- Prefer SVG for icons and logos
- Reference assets via ES module imports so Vite can hash file names for cache-busting
