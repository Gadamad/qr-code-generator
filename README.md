# QR Code Generator

**[Live Demo](https://qr-code-generator-rho-peach.vercel.app/)**

A free, self-hosted QR code generator that runs entirely in your browser. No scan limits, no paywalls, no account required.

## Features

- **10 QR code types** — URL, Text, WiFi, Contact (vCard), Email, SMS, WhatsApp, Crypto Payment, Calendar Event, Geo Location
- **Live preview** — QR code updates as you type
- **Full customization** — Foreground/background colors, gradients, dot styles, corner styles, logo embedding, size, margin, error correction
- **Multiple export formats** — PNG, SVG, PDF, JPEG, clipboard copy, Web Share (mobile)
- **Bulk generation** — Upload CSV or paste text to generate hundreds of QR codes at once, downloaded as a ZIP
- **Dark mode** — System preference detection + manual toggle
- **Fully responsive** — Works on mobile, tablet, and desktop
- **Privacy-first** — All processing happens client-side. No data leaves your browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript 5.9 |
| Build | Vite 7.3 |
| Styling | Tailwind CSS v4 |
| QR Engine | qr-code-styling (SVG rendering) |
| PDF Export | jsPDF |
| Bulk Export | JSZip + PapaParse |
| Tests | Vitest (113 tests) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── QRPreview.tsx          # Live QR code preview
│   ├── QRCustomizer.tsx       # Color, style, logo options
│   ├── DownloadOptions.tsx    # Export (PNG, SVG, PDF, JPEG, clipboard)
│   ├── BulkGenerator.tsx      # CSV/text batch generation
│   ├── TabSelector.tsx        # QR type navigation
│   ├── Header.tsx             # Logo, tagline, dark mode
│   └── types/                 # 10 QR type input forms
├── hooks/
│   ├── useQRGenerator.ts      # Core QR generation logic
│   ├── useDebounce.ts         # Input debouncing
│   └── useDownload.ts         # File export utilities
├── utils/
│   ├── payloads.ts            # Payload formatters per QR type
│   ├── validation.ts          # Input validators
│   ├── contrast.ts            # WCAG contrast checker
│   └── bulk.ts                # Bulk generation orchestrator
└── App.tsx                    # Main app shell
```

## Deployment

Static hosting — no server required. Build with `npm run build` and deploy the `dist/` folder to any host:

- **Vercel** — Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
- **Netlify** — `netlify deploy --prod`
- **Hostinger** — Git deploy via hPanel
- **Any CDN** — Upload `dist/` contents

## License

MIT
