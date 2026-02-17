# Developer Setup — QR Code Generator

**Version:** 0.1.0 (initial scaffold)
**Date:** 2026-02-17
**Source:** Master Prompt (`QR_CODE_GENERATOR_MASTER_PROMPT.md`)

---

## Prerequisites

| Requirement | Minimum Version | Verify Command |
|-------------|----------------|----------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |

No other system dependencies are required. All QR generation is client-side.

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd qr-code-generator

# Install dependencies
npm install
```

### Key Dependencies

**Runtime (installed via npm):**

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `qr-code-styling` | QR code generation with style customization |
| `jspdf` | PDF export |
| `jszip` | ZIP creation for bulk export |
| `file-saver` | Trigger file downloads |
| `papaparse` | CSV parsing for bulk import |

**Dev dependencies (pre-configured):**

| Package | Purpose |
|---------|---------|
| `vite` | Build tool and dev server |
| `typescript` | Type checking |
| `@vitejs/plugin-react` | React Fast Refresh |
| `eslint` + plugins | Code linting |
| `tailwindcss` | Utility-first CSS framework |

---

## Development Server

```bash
npm run dev
```

This starts the Vite dev server with Hot Module Replacement (HMR). Default URL: `http://localhost:5173`

The dev server:
- Rebuilds on file changes instantly
- Supports React Fast Refresh (preserves component state on edit)
- Serves the app at `http://localhost:5173` by default

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check with TypeScript, then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all source files |

---

## Build for Production

```bash
npm run build
```

This runs two steps:
1. `tsc -b` — TypeScript type checking (fails on type errors)
2. `vite build` — Bundles and optimizes for production

Output goes to the `dist/` directory. The contents of `dist/` are static files ready for deployment to any static hosting provider.

### Preview the Build

```bash
npm run preview
```

Starts a local server serving the `dist/` directory. Default URL: `http://localhost:4173`

---

## Project Structure

```
qr-code-generator/
├── docs/                  # Project documentation
├── public/                # Static assets (favicon, robots.txt, sitemap.xml)
├── src/
│   ├── components/        # React components
│   │   ├── types/         # QR type input forms (10 forms)
│   │   └── ...            # Core components (preview, customizer, download, bulk)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Pure utility functions
│   ├── workers/           # Web Workers for bulk generation
│   ├── types/             # Shared TypeScript interfaces
│   ├── App.tsx            # Main application shell
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind directives + global styles
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration (root)
├── tsconfig.app.json      # TypeScript configuration (app source)
├── tsconfig.node.json     # TypeScript configuration (Node tooling)
├── vite.config.ts         # Vite build configuration
└── eslint.config.js       # ESLint configuration
```

---

## Environment Variables

**None required for Phases 1-3.** The entire core application runs client-side with zero backend dependency.

Phase 4 (Analytics, optional) may require:
- `VITE_ANALYTICS_URL` — Redirect endpoint base URL (only if analytics backend is deployed)

---

## TypeScript Configuration

The project uses TypeScript 5.9 with strict mode enabled:
- `strict: true` — all strict checks
- `noUnusedLocals: true` — no dead variables
- `noUnusedParameters: true` — no unused function parameters
- Target: ES2022
- Module: ESNext with bundler resolution

---

## Linting

```bash
npm run lint
```

ESLint is configured with:
- `eslint-plugin-react-hooks` — enforces React Hooks rules
- `eslint-plugin-react-refresh` — validates React Fast Refresh compatibility
- `typescript-eslint` — TypeScript-specific rules

---

## Testing

Testing framework to be configured. Recommended setup:

```bash
# Install test dependencies (when ready)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

Add to `vite.config.ts`:
```typescript
/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

---

## Troubleshooting

### `npm run build` fails with type errors

Run `npx tsc --noEmit` to see the full list of type errors. Fix all errors before building — the build script runs type checking first.

### Port 5173 already in use

Vite will automatically try the next port (5174, 5175, etc.). Or specify a port:

```bash
npm run dev -- --port 3000
```

### Tailwind CSS classes not applying

Verify that `index.css` includes the Tailwind directives and that `tailwind.config.ts` (or v4 CSS config) is configured to scan `src/**/*.{ts,tsx}`.
