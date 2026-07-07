# Landing page & SEO

Static site in [`docs/`](.) for GitHub Pages.

## Live site

**https://kakajan.github.io/cursor-ollama/**

Repository: [github.com/kakajan/cursor-ollama](https://github.com/kakajan/cursor-ollama)  
Maintained by [@kakajan](https://github.com/kakajan) · **AYTRONIC CO** · [usher.ir](http://usher.ir)

**Languages:** English (default) · Persian (فارسی) — toggle in the header. Font: **Vazirmatn**.

## Files

| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Landing page (EN + FA) |
| [`landing.css`](landing.css) | Landing page styles |
| [`i18n.js`](i18n.js) | English + Persian copy (marketing + wizard guide) |
| [`logo.svg`](logo.svg) | Nav logo (synced from `assets/logo.svg`) |
| [`logo.png`](logo.png) | Favicon (32×32, synced from `assets/logo.png`) |
| [`seo.json`](seo.json) | SEO metadata source of truth |
| [`og-image.webp`](og-image.webp) | Open Graph / Twitter card (WebP) |
| [`social-preview.webp`](social-preview.webp) | GitHub social preview (1280×640, WebP) |
| [`robots.txt`](robots.txt) | Crawler rules + sitemap |
| [`sitemap.xml`](sitemap.xml) | Sitemap |

## Enable GitHub Pages

1. Repo **Settings → Pages**
2. Source: **GitHub Actions**
3. Push to `main` — [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) deploys `docs/`

## SEO checklist

- [x] Canonical URL: `https://kakajan.github.io/cursor-ollama/`
- [x] OG image: `https://kakajan.github.io/cursor-ollama/og-image.webp`
- [x] Bilingual landing (EN default, FA toggle)
- [x] GitHub social preview: [`social-preview.webp`](social-preview.webp) (1280×640)
- [ ] Verify OG preview: [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Submit sitemap in Google Search Console

## Keep in sync

When changing marketing copy, update:

1. [`seo.json`](seo.json) — meta title/description/keywords
2. [`i18n.js`](i18n.js) — EN + FA strings (wizard steps, settings/tray, quick tunnel FAQ)
3. [`../README.md`](../README.md) — full CLI / installer documentation
