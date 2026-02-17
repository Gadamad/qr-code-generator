# Deployment Guide — QR Code Generator

**Version:** 0.1.0 (initial scaffold)
**Date:** 2026-02-17
**Source:** Master Prompt (`QR_CODE_GENERATOR_MASTER_PROMPT.md`)

---

## Overview

The QR Code Generator is a static single-page application. The production build output (`dist/` directory) contains only HTML, CSS, JavaScript, and static assets. No server-side runtime is required for Phases 1-3.

### Build for Production

```bash
npm run build
```

Output: `dist/` directory containing all static files.

---

## Deployment Options

### Vercel (Recommended)

Vercel has native Vite support with zero configuration.

**Option A: Git Integration**
1. Push code to GitHub/GitLab/Bitbucket
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite and configures build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Every push to `main` triggers automatic deployment

**Option B: CLI**
```bash
npm install -g vercel
vercel deploy --prod
```

**Environment variables:** None required for core features.

---

### Netlify

**Option A: Git Integration**
1. Push code to GitHub/GitLab/Bitbucket
2. Connect at [app.netlify.com](https://app.netlify.com)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Automatic deploys on push

**Option B: CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**SPA routing note:** Since this is a single-page app with no client-side routing (tab-based navigation only), no `_redirects` or `netlify.toml` rewrite rules are needed.

---

### Hostinger (Static Hosting via hPanel)

Hostinger deploys via Git push to hPanel.

**Setup:**
1. In hPanel, navigate to **Advanced** > **Git**
2. Create a Git repository or connect your GitHub repo
3. Set the deployment branch (e.g., `main`)
4. Build locally or use GitHub Actions to build, then deploy the `dist/` contents

**Gotchas:**
- **No environment variables needed** — the app is fully client-side
- **CDN cache:** Hostinger CDN does not auto-purge on deploy. Set `s-maxage=60` for HTML files, or manually purge CDN cache after deploy
- **Do NOT use** `output: 'standalone'` in any config — this is a static SPA, not a Node.js app

**Cache headers (recommended):**
Add to your deployment configuration or `.htaccess`:
```
# HTML: short cache, revalidate often
Cache-Control: public, s-maxage=60, max-age=0, must-revalidate

# JS/CSS (hashed filenames): long cache
Cache-Control: public, max-age=31536000, immutable
```

---

### Generic Static Hosting

Any static file server or CDN can host this application.

**Steps:**
1. Run `npm run build`
2. Upload the contents of `dist/` to your hosting provider
3. Ensure `index.html` is served for the root path

**Providers that work:**
- AWS S3 + CloudFront
- Google Cloud Storage + Cloud CDN
- Azure Blob Storage + Azure CDN
- Cloudflare Pages
- GitHub Pages
- Firebase Hosting
- Surge.sh
- Any Apache/Nginx server serving static files

---

## Environment Variables

### Phases 1-3 (Core Application)

**None.** Zero environment variables are required. The entire application runs client-side.

### Phase 4 (Analytics — Optional)

If the analytics backend is deployed, one variable is needed:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ANALYTICS_URL` | Base URL for the redirect/tracking endpoint | `https://yourdomain.com/r` |

Set this in `.env` (local development) or in your hosting provider's environment variable configuration.

Note: Vite only exposes variables prefixed with `VITE_` to the client-side bundle.

---

## CDN Considerations

### Cache Busting

Vite includes content hashes in output filenames (e.g., `index-abc123.js`). This means:
- **JS and CSS files:** Safe to cache indefinitely (`max-age=31536000, immutable`)
- **`index.html`:** Must NOT be cached long-term — it references the hashed filenames

### Recommended Cache Strategy

| File Type | Cache-Control Header |
|-----------|---------------------|
| `index.html` | `public, s-maxage=60, max-age=0, must-revalidate` |
| `*.js`, `*.css` | `public, max-age=31536000, immutable` |
| Images, fonts | `public, max-age=86400` |

### Post-Deploy Cache Purge

If your CDN does not auto-purge on deploy:
1. Deploy new files
2. Purge CDN cache for `index.html` (or all HTML files)
3. Hashed JS/CSS files do not need purging — new filenames are different

---

## Pre-Deployment Checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run preview` serves the app correctly at localhost
- [ ] QR codes generate and scan correctly on mobile device
- [ ] Dark mode works (system detection + manual toggle)
- [ ] Download works for all formats (PNG, SVG, PDF, JPEG)
- [ ] Mobile layout is correct and usable
- [ ] SEO tags present in `index.html` (title, description, OG image)
- [ ] `robots.txt` and `sitemap.xml` present in `public/`
- [ ] No secrets or API keys in the codebase

---

## SEO Files

Ensure these exist in `public/` before deploying to a public URL:

### `public/robots.txt`
```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

### `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Replace `yourdomain.com` with the actual deployment URL.
