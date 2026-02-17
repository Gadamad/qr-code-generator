# PRP: QR Code Generator

## 1. Core Principles & Project Overview

### Primary Goal

Build a free, self-hosted QR code generator web app that runs entirely client-side — fast, clean, fully featured, with no scan limits, no paywalls, and no account required.

### Success Criteria

- [ ] All 10 QR code types generate valid, scannable codes
- [ ] Live preview updates within 150ms of user input
- [ ] Customization (colors, logo, styles) applies without breaking scannability
- [ ] Bulk generation handles up to 500 QR codes per batch via Web Workers
- [ ] Download works in PNG, SVG, PDF, JPEG formats + clipboard copy
- [ ] Fully responsive on mobile, tablet, and desktop
- [ ] Dark mode with system preference detection + manual toggle
- [ ] WCAG-compliant keyboard navigation and ARIA labels
- [ ] All tests pass
- [ ] Production build succeeds with zero errors

### Non-Functional Requirements

- **Performance:** QR generation debounced at 150ms in forms only (no stacked debounce); SVG rendering (not canvas) for reliability; bulk module lazy-loaded; Web Workers for batch processing
- **Security:** No server-side processing for core features; no user data stored; no cookies; all generation is client-side
- **Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge); mobile-first responsive; works on any static host
- **Accessibility:** ARIA labels on all interactive elements; keyboard navigation; sufficient color contrast (with warnings when contrast is low)

---

## 2. Feature & Tool List

### QR Type Forms (10 Types)

#### Type 1: URL
- **Purpose:** Generate QR code from a URL
- **Input:** URL string (auto-prepends `https://` if missing)
- **Output:** Raw URL string payload
- **Validation:** URL format check, auto-prepend protocol

#### Type 2: Plain Text
- **Purpose:** Encode arbitrary text as QR code
- **Input:** Multi-line textarea
- **Output:** Raw text string payload
- **Validation:** Non-empty check

#### Type 3: WiFi
- **Purpose:** Generate WiFi network login QR code
- **Input:** SSID (string), Password (string), Encryption (WPA/WEP/None), Hidden (boolean)
- **Output:** `WIFI:T:{encryption};S:{ssid};P:{password};H:{hidden};;`
- **Validation:** SSID required; password required when encryption is not None

#### Type 4: vCard (Contact)
- **Purpose:** Encode contact information in vCard 3.0 format
- **Input:** First name, Last name, Phone, Email, Organization, Title, Website, Address
- **Output:** Standard vCard 3.0 string (BEGIN:VCARD ... END:VCARD)
- **Validation:** At least first name or last name required

#### Type 5: Email
- **Purpose:** Generate mailto QR code
- **Input:** Email address, Subject (optional), Body (optional)
- **Output:** `mailto:{email}?subject={subject}&body={body}`
- **Validation:** Valid email format

#### Type 6: SMS
- **Purpose:** Generate SMS QR code
- **Input:** Phone number, Message (optional)
- **Output:** `sms:{phone}?body={message}`
- **Validation:** Phone number format

#### Type 7: WhatsApp
- **Purpose:** Generate WhatsApp deep link QR code
- **Input:** Phone number (with country code), Pre-filled message (optional)
- **Output:** `https://wa.me/{phone}?text={message}`
- **Validation:** Phone with country code required

#### Type 8: Crypto Payment
- **Purpose:** Generate cryptocurrency payment QR code
- **Input:** Coin selector (BTC/ETH/LTC), Wallet address, Amount (optional), Label (optional)
- **Output:** Protocol-specific URI:
  - BTC: `bitcoin:{address}?amount={amount}&label={label}`
  - ETH: `ethereum:{address}?value={amount}`
  - LTC: `litecoin:{address}?amount={amount}`
- **Validation:** Wallet address format per coin type

#### Type 9: Calendar Event
- **Purpose:** Generate iCal VEVENT QR code
- **Input:** Event title, Location, Start date/time, End date/time, Description
- **Output:** iCal VEVENT format string
- **Validation:** Title and start date required; end date >= start date

#### Type 10: Geo Location
- **Purpose:** Generate geographic coordinates QR code
- **Input:** Latitude, Longitude
- **Output:** `geo:{lat},{lng}`
- **Validation:** Valid lat (-90 to 90), lng (-180 to 180)

### Core Components

#### QR Preview (`QRPreview.tsx`)
- **Purpose:** Real-time QR code rendering on canvas
- **Input:** Payload string, customization options (colors, style, logo, size)
- **Output:** Rendered QR code on HTML canvas
- **Dependencies:** `qr-code-styling` library

#### QR Customizer (`QRCustomizer.tsx`)
- **Purpose:** Color, style, and logo customization panel
- **Input:** User selections (foreground/background colors, gradient, dot style, corner style, logo file, size, margin)
- **Output:** Customization options object passed to QRPreview
- **Dependencies:** None (pure UI component)

#### Download Options (`DownloadOptions.tsx`)
- **Purpose:** Export QR code in various formats
- **Input:** Current QR canvas state
- **Output:** Downloaded file (PNG, SVG, PDF, JPEG) or clipboard image
- **Dependencies:** `jspdf` (PDF), `file-saver` (download helper), Web Share API (mobile)

#### Bulk Generator (`BulkGenerator.tsx`)
- **Purpose:** Batch QR code generation from CSV or text input
- **Input:** CSV file upload or multi-line text, QR type selection, customization options
- **Output:** ZIP archive of generated QR codes
- **Dependencies:** `papaparse` (CSV parsing), `jszip` (ZIP creation), Web Worker (`qrWorker.ts`)

### Hooks

#### `useQRGenerator.ts`
- **Purpose:** Core QR generation logic wrapping `qr-code-styling`
- **Input:** Payload string, options object
- **Output:** QR code instance with canvas rendering

#### `useDebounce.ts`
- **Purpose:** Debounce input changes before triggering QR regeneration
- **Input:** Value, delay (150ms default)
- **Output:** Debounced value

#### `useDownload.ts`
- **Purpose:** File export utilities for all formats
- **Input:** QR code instance, format selection, filename
- **Output:** Downloaded file or clipboard write

### Utilities

#### `payloads.ts`
- **Purpose:** Format input data into QR-scannable payload strings per type
- **Input:** Type-specific form data
- **Output:** Formatted payload string

#### `validation.ts`
- **Purpose:** Validate form inputs per QR type
- **Input:** Type-specific form data
- **Output:** Validation result (valid boolean + error messages)

#### `contrast.ts`
- **Purpose:** Calculate color contrast ratio and warn if too low for scanning
- **Input:** Foreground color, background color
- **Output:** Contrast ratio number + warning boolean

#### `bulk.ts`
- **Purpose:** Orchestrate bulk generation with progress tracking
- **Input:** Array of payloads, customization options
- **Output:** ZIP blob of generated QR images

### Web Worker

#### `qrWorker.ts`
- **Purpose:** Off-main-thread QR generation for bulk processing
- **Input:** Array of payload + options pairs
- **Output:** Array of generated image blobs with progress messages

---

## 3. Documentation & References

### External Documentation (RAG)

- [qr-code-styling](https://github.com/nicross/qr-code-styling) — Styled QR code generation with canvas
- [JSZip](https://stuk.github.io/jszip/) — ZIP file creation in JavaScript
- [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/) — PDF generation
- [PapaParse](https://www.papaparse.com/docs) — CSV parsing
- [file-saver](https://github.com/nicross/file-saver) — Client-side file download
- [Tailwind CSS v4](https://tailwindcss.com/docs) — Utility-first CSS framework
- [Vite](https://vite.dev/guide/) — Build tool and dev server
- [React 19](https://react.dev/) — UI library

### Design Patterns to Follow

- Payload formatting: one pure function per QR type in `payloads.ts`
- Validation: one validator per QR type in `validation.ts` — returns `{ valid: boolean; errors: string[] }`
- Component pattern: each QR type form is a self-contained component receiving `onChange` callback
- State management: React `useState` + `useReducer` for form state; no external state library needed for an SPA of this scope

---

## 4. Current vs. Desired Structure

| File | Current State | Desired State |
|------|--------------|---------------|
| `src/App.tsx` | Vite default template | Main app shell with tab navigation, dark mode, layout |
| `src/components/QRPreview.tsx` | Does not exist | Live QR preview with canvas rendering |
| `src/components/QRCustomizer.tsx` | Does not exist | Color, style, logo customization panel |
| `src/components/DownloadOptions.tsx` | Does not exist | PNG/SVG/PDF/JPEG export + clipboard + share |
| `src/components/BulkGenerator.tsx` | Does not exist | CSV upload, batch text, ZIP download |
| `src/components/types/URLForm.tsx` | Does not exist | URL QR input form |
| `src/components/types/TextForm.tsx` | Does not exist | Plain text QR input form |
| `src/components/types/WiFiForm.tsx` | Does not exist | WiFi QR input form |
| `src/components/types/VCardForm.tsx` | Does not exist | vCard 3.0 contact form |
| `src/components/types/EmailForm.tsx` | Does not exist | Email (mailto) form |
| `src/components/types/SMSForm.tsx` | Does not exist | SMS form |
| `src/components/types/WhatsAppForm.tsx` | Does not exist | WhatsApp deep link form |
| `src/components/types/CryptoForm.tsx` | Does not exist | Crypto payment form (BTC/ETH/LTC) |
| `src/components/types/CalendarForm.tsx` | Does not exist | iCal event form |
| `src/components/types/GeoForm.tsx` | Does not exist | Geo location form |
| `src/hooks/useQRGenerator.ts` | Does not exist | Core QR generation hook |
| `src/hooks/useDebounce.ts` | Does not exist | 150ms debounce hook |
| `src/hooks/useDownload.ts` | Does not exist | File export hook |
| `src/utils/payloads.ts` | Does not exist | Payload formatters per QR type |
| `src/utils/validation.ts` | Does not exist | Input validators per QR type |
| `src/utils/contrast.ts` | Does not exist | Color contrast checker |
| `src/utils/bulk.ts` | Does not exist | Bulk generation orchestrator |
| `src/workers/qrWorker.ts` | Does not exist | Web Worker for bulk QR generation |
| `index.html` | Vite default | Updated title, meta tags, OG image, favicon |
| `public/robots.txt` | Does not exist | SEO robots.txt |
| `public/sitemap.xml` | Does not exist | SEO sitemap |

---

## 5. Agent Runbook

### Implementation Order (4 Phases)

#### Phase 1: Core Generator (MVP)
1. Install dependencies: `qr-code-styling`, `file-saver`, Tailwind CSS v4
2. Build App shell: tab navigation, dark mode toggle, responsive layout
3. Implement payload formatters for URL, Text, WiFi, vCard, Email in `payloads.ts`
4. Implement validators for the same 5 types in `validation.ts`
5. Build 5 QR type forms: URLForm, TextForm, WiFiForm, VCardForm, EmailForm
6. Build QRPreview component with canvas rendering
7. Build QRCustomizer — colors only (foreground + background)
8. Build DownloadOptions — PNG and SVG only
9. Implement `useQRGenerator`, `useDebounce` hooks
10. Wire everything into App.tsx with live preview
11. Make fully mobile responsive
12. Add dark mode (system preference + manual toggle)
13. Run lint + test

#### Phase 2: Full Suite + Customization
1. Install additional dependency: `jspdf`
2. Build remaining 5 QR type forms: SMSForm, WhatsAppForm, CryptoForm, CalendarForm, GeoForm
3. Implement payload formatters + validators for the new 5 types
4. Add logo embedding to QRCustomizer (upload, auto-size 20-25%, force error correction H)
5. Add style options: dot style (square/rounded/circle/diamond), corner style (square/rounded/dots)
6. Add gradient option for foreground
7. Build contrast checker utility + warning display
8. Add PDF download to DownloadOptions
9. Add JPEG download
10. Add clipboard copy (Clipboard API)
11. Add Web Share API integration (mobile)
12. Run lint + test

#### Phase 3: Bulk Generation
1. Install dependencies: `papaparse`, `jszip`
2. Build CSV upload + auto-column detection
3. Build batch text input (one item per line)
4. Create Web Worker for off-main-thread generation
5. Build progress indicator
6. Build ZIP download
7. Build preview of first 5 QR codes before batch generation
8. Run lint + test

#### Phase 4: Analytics (Optional — Requires Backend)
1. Choose backend: Cloudflare Workers + D1 or Supabase
2. Build redirect endpoint with short code generation
3. Implement scan logging (timestamp, location from IP, device type, referrer)
4. Build analytics dashboard with Recharts (line chart, bar chart, pie chart)
5. Implement secret URL access pattern
6. Target redirect latency < 50ms
7. Run lint + test

### Design Patterns to Follow

- **Pure payload formatters:** Each type's formatter is a pure function — input data in, string out. No side effects.
- **Controlled forms:** All QR type forms are controlled components using React state, calling `onChange` with typed payload data.
- **Debounced preview:** Input changes flow through `useDebounce(150ms)` before triggering QR regeneration.
- **SVG-first rendering:** All QR codes render as SVG for reliability (canvas `.update()` is buggy in qr-code-styling). Instance is fully recreated on each option change.
- **Progressive enhancement:** Core generation works without JavaScript features like Web Workers; bulk uses Workers when available.

### Validation Gates

After each phase:
1. Run linter: `npm run lint`
2. Run tests: `npm test`
3. Run build: `npm run build`
4. Manual test: verify QR codes scan correctly on mobile device
5. Fix any failures before proceeding to next phase

---

## 6. Implementation Details

### State Management

No external state library. Use React built-ins:
- `useState` for form inputs, active tab, dark mode, customization options
- `useReducer` if form state becomes complex (vCard has many fields)
- Lift state to App.tsx: active QR type, current payload, customization options
- Pass down via props (component tree is shallow enough — no context needed for MVP)

### QR Generation Pipeline

```
User Input → Form Component → onChange callback
  → App.tsx updates payload state
  → useDebounce(payload, 150ms)
  → useQRGenerator(debouncedPayload, options)
  → qr-code-styling renders to canvas
  → QRPreview displays canvas
```

### File Export Pipeline

```
User clicks download button
  → useDownload reads current QR instance
  → Format-specific export:
     PNG: canvas.toBlob() → file-saver
     SVG: qr-code-styling .getRawData('svg') → file-saver
     PDF: canvas.toDataURL() → jsPDF → file-saver
     JPEG: canvas.toBlob('image/jpeg') → file-saver
     Clipboard: canvas.toBlob() → navigator.clipboard.write()
     Share: canvas.toBlob() → navigator.share()
```

### Bulk Generation Pipeline

```
User uploads CSV or pastes text
  → papaparse extracts rows (CSV) or split by newline (text)
  → Map rows to payload strings using payloads.ts formatters
  → Preview first 5 in UI
  → User confirms → post payloads to Web Worker
  → Worker generates QR images one by one, posting progress messages
  → Main thread updates progress bar
  → Worker posts back array of image blobs
  → jszip packages blobs into ZIP
  → file-saver triggers download
```

### Error Correction Levels

| Scenario | Level | Recovery |
|----------|-------|----------|
| Default (no logo) | M | 15% |
| Logo embedded | H (forced) | 30% |
| User override | Selectable | L/M/Q/H |

### SEO (Static Hosting)

Update `index.html`:
- `<title>`: "Free QR Code Generator — No Limits, No Sign-up"
- `<meta name="description">`: "Generate QR codes for URLs, WiFi, contacts, WhatsApp, crypto and more. Free forever. No scan limits. No account required."
- Open Graph tags: `og:title`, `og:description`, `og:image` (screenshot of app)
- Canonical URL
- Add `public/robots.txt` and `public/sitemap.xml`

### Deployment

Static hosting — no server required for Phases 1-3:
- **Vercel:** `vercel deploy` or Git integration
- **Netlify:** `netlify deploy --prod` or Git integration
- **Hostinger:** Git deploy via hPanel (zero env vars needed)
- **Any CDN:** Upload contents of `dist/` after `npm run build`

---

## Security Constraints

- DO NOT store any user data — all processing is client-side
- DO NOT make network requests for core QR generation
- DO NOT require cookies, localStorage, or any persistent state for basic functionality (dark mode preference is the only exception)
- DO validate all user inputs at form boundaries before passing to payload formatters
- DO sanitize file uploads (logo images) — validate MIME type and file size
- DO NOT hardcode any API keys or tokens (there are none for Phases 1-3)

---

## Post-Build Gotchas (Critical for maintenance)

1. **qr-code-styling `.update()` is broken with canvas** — Always use `type: 'svg'` and recreate the full instance on option changes. Never use `.update()`.
2. **Inline options objects = infinite render loops** — Always `useMemo` the options object passed to `useQRGenerator`. New object refs trigger debounce → state → re-render → loop.
3. **React refs don't notify parents** — `qrInstance.current` must be mirrored to `useState` to trigger `onInstanceReady` callback for download buttons.
4. **Never stack debounces** — Forms debounce at 150ms. Do NOT add extra debounce in App.tsx or the hook. Triple debounce = 600ms+ delay, appears broken.
5. **QR preview flashes on regeneration** — Instance recreation causes brief blank. Hide/Show toggle lets users hide preview while editing.
