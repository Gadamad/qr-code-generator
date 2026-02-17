# Architecture — QR Code Generator

**Version:** 0.2.0 (post-integration fixes)
**Date:** 2026-02-17
**Source:** Master Prompt (`QR_CODE_GENERATOR_MASTER_PROMPT.md`)

---

## System Overview

This is a **client-only single-page application (SPA)**. All QR code generation, customization, and export happens in the browser. No backend is required for Phases 1-3. Phase 4 (Analytics) is the only feature requiring server infrastructure and is designed as an optional add-on.

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌─────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │  Input   │──▶│ Payload  │──▶│  qr-code-styling │  │
│  │  Forms   │   │ Formatter│   │  (SVG render)    │  │
│  └─────────┘   └──────────┘   └────────┬────────┘  │
│                                         │           │
│                                ┌────────▼────────┐  │
│                                │   QR Preview     │  │
│                                │   (live SVG)     │  │
│                                └────────┬────────┘  │
│                                         │           │
│                    ┌────────────────────▼──────┐    │
│                    │     Download / Export      │    │
│                    │  PNG │ SVG │ PDF │ JPEG    │    │
│                    │  Clipboard │ Web Share     │    │
│                    └───────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │         Bulk Generation (Phase 3)           │    │
│  │  CSV/Text → Web Worker → ZIP Download       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.tsx
├── Header (logo + tagline + dark mode toggle)
├── TabSelector (10 QR types)
├── Main Content Area
│   ├── Active QR Type Form (one of 10)
│   │   ├── URLForm.tsx
│   │   ├── TextForm.tsx
│   │   ├── WiFiForm.tsx
│   │   ├── VCardForm.tsx
│   │   ├── EmailForm.tsx
│   │   ├── SMSForm.tsx
│   │   ├── WhatsAppForm.tsx
│   │   ├── CryptoForm.tsx
│   │   ├── CalendarForm.tsx
│   │   └── GeoForm.tsx
│   ├── QRPreview.tsx (live canvas preview)
│   └── QRCustomizer.tsx (colors, styles, logo)
├── DownloadOptions.tsx (export buttons)
└── BulkGenerator.tsx (Phase 3)
    └── BulkPreview (first 5 items)
```

### Layout Strategy

- **Desktop:** Two-column layout — form on the left, preview on the right
- **Mobile:** Single column — form on top, preview below
- Tab selector spans full width on both layouts

---

## State Management

No external state library. React built-ins only.

### State Tree (lifted to App.tsx)

```typescript
interface AppState {
  activeTab: QRType;              // Which QR type is selected
  formData: Record<QRType, any>;  // Form data per type (preserved on tab switch)
  payload: string;                // Computed payload string from active form
  options: QROptions;             // Customization: colors, style, logo, size, margin
  darkMode: 'system' | 'light' | 'dark';
}

interface QROptions {
  foregroundColor: string;
  backgroundColor: string;
  gradient: { enabled: boolean; color1: string; color2: string } | null;
  dotStyle: 'square' | 'rounded' | 'circle' | 'diamond';
  cornerStyle: 'square' | 'rounded' | 'dots';
  logo: File | null;
  size: number;           // 256 to 2048
  margin: number;         // quiet zone modules (default: 4)
  errorCorrection: 'L' | 'M' | 'Q' | 'H';  // auto-set to H when logo present
}

type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email'
            | 'sms' | 'whatsapp' | 'crypto' | 'calendar' | 'geo';
```

### Data Flow

```
Tab switch → activeTab state update → render corresponding form
Form input → formData[activeTab] update → payloads.ts computes payload string
Payload change → useDebounce(150ms) → useQRGenerator produces new QR instance
QR instance → QRPreview renders to canvas
Customization change → options state update → useQRGenerator re-renders
Download click → useDownload reads QR instance → exports to selected format
```

---

## QR Generation Pipeline

### Single QR Code

1. User types into form
2. Form component calls `onChange` with structured data
3. `App.tsx` updates `formData[activeTab]`
4. `payloads.ts` formatter converts form data to QR-scannable string
5. `useDebounce` waits 150ms after last change
6. `useQRGenerator` passes debounced payload + options to `qr-code-styling`
7. Library renders styled QR code to `<canvas>` element
8. `QRPreview` displays the canvas

### Error Correction Logic

- Default: **M** (15% recovery) — good balance of density and reliability
- When logo is embedded: automatically switches to **H** (30% recovery) — logo occludes center modules
- User can override via QRCustomizer (advanced option)

---

## File Export Pipeline

### PNG Export
```
canvas.toBlob('image/png') → file-saver.saveAs(blob, filename)
```

### SVG Export
```
qr-code-styling.getRawData('svg') → file-saver.saveAs(svgBlob, filename)
```

### PDF Export
```
canvas.toDataURL('image/png') → jsPDF.addImage() → jsPDF.save(filename)
Optional: label text below QR via jsPDF.text()
```

### JPEG Export
```
canvas.toBlob('image/jpeg', quality) → file-saver.saveAs(blob, filename)
```

### Clipboard Copy
```
canvas.toBlob('image/png') → new ClipboardItem({'image/png': blob})
  → navigator.clipboard.write([item])
```

### Web Share (Mobile)
```
canvas.toBlob('image/png') → new File([blob], filename)
  → navigator.share({ files: [file] })
```

---

## Bulk Generation (Phase 3)

### Architecture

```
Main Thread                          Web Worker
┌──────────────┐                    ┌──────────────────┐
│ CSV/Text     │   postMessage()    │                  │
│ Input        │──────────────────▶│ qrWorker.ts      │
│              │                    │                  │
│ Progress Bar │◀──────────────────│ Generate QR #1   │
│ (updates)    │   progress msg     │ Generate QR #2   │
│              │                    │ ...              │
│ ZIP Download │◀──────────────────│ Generate QR #N   │
│              │   complete msg     │                  │
└──────────────┘   (blob array)     └──────────────────┘
```

### Processing Flow

1. **Input parsing:** PapaParse for CSV; `split('\n')` for text input
2. **Column mapping:** Auto-detect columns based on header names; allow manual mapping
3. **Preview:** Generate first 5 QR codes on main thread for user verification
4. **Worker dispatch:** Post full payload array to Web Worker
5. **Generation:** Worker generates QR images sequentially, posting progress after each
6. **Packaging:** Main thread collects blobs, creates ZIP via JSZip
7. **Download:** file-saver triggers ZIP download

### Limits

- Maximum 500 QR codes per batch (client-side constraint)
- Progress bar updates after each code generated
- Cancel button stops the Web Worker

---

## Performance Considerations

| Concern | Strategy |
|---------|----------|
| Input lag | 150ms debounce on all form inputs before QR regeneration |
| Canvas rendering | `requestAnimationFrame` for smooth updates |
| Bulk processing | Web Workers keep UI responsive during batch generation |
| Bundle size | Lazy-load `BulkGenerator` component (Phase 3 module) |
| Initial load | Vite code splitting — only load active QR type form |
| Image assets | Logo uploads validated for size; canvas operations are memory-bounded |

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 19.2.x | Component rendering |
| Language | TypeScript | 5.9.x | Type safety |
| Build Tool | Vite | 7.3.x | Dev server + production bundler |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| QR Generation | qr-code-styling | ^1.6.0 | Styled QR codes with canvas |
| PDF Export | jsPDF | ^2.5.0 | PDF file generation |
| ZIP Creation | JSZip | ^3.10.0 | Bulk export packaging |
| CSV Parsing | PapaParse | ^5.4.0 | Bulk import |
| File Download | file-saver | ^2.0.5 | Trigger browser downloads |
| Charts | Recharts | ^2.8.0 | Analytics (Phase 4 only) |

---

## File Structure

```
src/
├── components/
│   ├── QRPreview.tsx           # Live QR code preview with canvas
│   ├── QRCustomizer.tsx        # Color, style, logo options
│   ├── DownloadOptions.tsx     # Export buttons (PNG, SVG, PDF, JPEG, clipboard, share)
│   ├── BulkGenerator.tsx       # CSV upload + batch processing (Phase 3)
│   ├── TabSelector.tsx         # QR type tab navigation
│   ├── Header.tsx              # Logo, tagline, dark mode toggle
│   └── types/                  # QR type input forms (one per type)
│       ├── URLForm.tsx
│       ├── TextForm.tsx
│       ├── WiFiForm.tsx
│       ├── VCardForm.tsx
│       ├── EmailForm.tsx
│       ├── SMSForm.tsx
│       ├── WhatsAppForm.tsx
│       ├── CryptoForm.tsx
│       ├── CalendarForm.tsx
│       └── GeoForm.tsx
├── hooks/
│   ├── useQRGenerator.ts       # Core QR generation logic
│   ├── useDebounce.ts          # Input debouncing (150ms)
│   └── useDownload.ts          # File export utilities
├── utils/
│   ├── payloads.ts             # QR payload formatters per type
│   ├── validation.ts           # Input validation per type
│   ├── contrast.ts             # Color contrast checker
│   └── bulk.ts                 # Bulk generation orchestrator
├── workers/
│   └── qrWorker.ts             # Web Worker for bulk generation
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── App.tsx                     # Main app shell
├── main.tsx                    # Entry point
└── index.css                   # Tailwind directives + global styles
```

---

## Known Constraints

- **No SSR:** This is a client-only SPA. No server-side rendering.
- **No routing:** Tab-based navigation via state, not URL routes.
- **No persistent storage:** No localStorage, cookies, or database for Phases 1-3 (dark mode preference is the only exception).
- **Web Worker browser support:** Required for bulk generation; fallback to main thread if unavailable.
- **Clipboard API:** Requires HTTPS and user gesture; may not work in all browsers.
- **Web Share API:** Mobile only; feature-detected at runtime.

---

## Gotchas & Lessons Learned

### 1. qr-code-styling `.update()` is unreliable with canvas
The library's `.update()` method fails to re-render when switching from empty data to real data on canvas type. **Fix:** Use `type: 'svg'` and recreate the entire QRCodeStyling instance on each option change instead of calling `.update()`.

### 2. Inline options objects cause infinite render loops
Passing a new `options` object literal to `useQRGenerator` on every render triggers: debounce → update → `isGenerating` state change → re-render → new object → loop. **Fix:** Wrap options in `useMemo` with explicit dependency array in `QRPreview.tsx`.

### 3. React refs don't trigger re-renders for parent callbacks
Returning `qrInstance.current` (a ref) from the hook means the parent never gets notified when the instance changes. **Fix:** Mirror the ref into a `useState` so the parent's `onInstanceReady` callback fires correctly.

### 4. Triple debounce stacks silently
Forms debounce at 150ms, App.tsx debounced at 300ms, and the hook debounced at 150ms = 600ms total delay. **Fix:** Only debounce in the forms (150ms). Remove the extra layers.

### 5. QR preview flashing during regeneration
Since the instance is recreated on each change, the QR code briefly disappears and reappears. **Fix:** Added a Hide/Show toggle so users can hide the preview while editing, then show it when ready to scan/download.
