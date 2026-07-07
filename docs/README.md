# Landing Page And SEO

This folder contains the public landing page for cursor-ollama:

**https://kakajan.github.io/cursor-ollama/**

The page is intentionally simple. It should feel like a developer explaining a tool he built with care: clear, honest, practical, and welcoming to people who want to use, improve, or support the project.

## What Lives Here

| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Static landing page shell and SEO tags |
| [`i18n.js`](i18n.js) | English and Persian landing copy |
| [`landing.css`](landing.css) | Visual styling |
| [`logo.svg`](logo.svg) | Header logo, synced from `assets/logo.svg` |
| [`logo.png`](logo.png) | Favicon, synced from `assets/logo.png` |
| [`seo.json`](seo.json) | SEO metadata source |
| [`robots.txt`](robots.txt) | Crawler rules and sitemap link |
| [`sitemap.xml`](sitemap.xml) | Sitemap |

## Content Voice

Keep the copy human and useful:

- Explain the real problem: Cursor cannot simply reach local Ollama in every flow.
- Be honest about privacy: requests route to local Ollama, but Cursor is still part of the IDE flow.
- Prefer short, practical guidance over marketing noise.
- Avoid AI-sounding phrases, filler, and exaggerated promises.
- Invite support warmly: stars, issues, docs fixes, pull requests, and sharing the project all count.
- Keep Persian text natural. A developer should be able to read it without feeling it was machine-translated.

## Keep Things In Sync

When changing public copy, update these together:

1. [`i18n.js`](i18n.js) for the visible English and Persian text.
2. [`index.html`](index.html) for fallback text, meta tags, Open Graph, Twitter card, and structured data.
3. [`seo.json`](seo.json) for the shared SEO summary and social preview metadata.
4. [`../README.md`](../README.md) if the change affects installation, commands, privacy, support, or contribution guidance.

## GitHub Pages

Deployment uses GitHub Pages from the `docs/` folder.

1. Repository `Settings -> Pages`
2. Source: GitHub Actions
3. Push to `main`

The workflow at [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) publishes this folder.

## SEO Checklist

- [x] Canonical URL: `https://kakajan.github.io/cursor-ollama/`
- [x] Bilingual landing: English default, Persian toggle
- [x] Human meta description aligned with page copy
- [x] Open Graph and Twitter card metadata
- [x] Sitemap and robots file
- [ ] Verify social preview with [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Submit sitemap in Google Search Console
