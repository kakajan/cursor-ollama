# Landing page & SEO

Static site in [`docs/`](docs/) for GitHub Pages.

## Live site

**https://kakajan.github.io/cursor-ollama/**

Repository: [github.com/kakajan/cursor-ollama](https://github.com/kakajan/cursor-ollama)  
Maintained by [@kakajan](https://github.com/kakajan) · **AYTRONIC CO** · [usher.ir](http://usher.ir)

## Files

| File | Purpose |
|------|---------|
| [`docs/index.html`](index.html) | Landing page |
| [`docs/seo.json`](seo.json) | Central SEO config |
| [`docs/og-image.webp`](og-image.webp) | Open Graph / Twitter card (WebP) |
| [`docs/social-preview.webp`](social-preview.webp) | GitHub social preview (1280×640, WebP) |
| [`docs/robots.txt`](robots.txt) | Crawler rules + sitemap |
| [`docs/sitemap.xml`](sitemap.xml) | Sitemap |

## Enable GitHub Pages

1. Repo **Settings → Pages**
2. Source: **GitHub Actions**
3. Push to `main` — [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) deploys `docs/`

## SEO checklist

- [x] Canonical URL: `https://kakajan.github.io/cursor-ollama/`
- [x] OG image: `https://kakajan.github.io/cursor-ollama/og-image.webp`
- [x] GitHub social preview: [`docs/social-preview.webp`](social-preview.webp) (1280×640) — upload in repo **Settings → General → Social preview**
- [ ] Verify OG preview: [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Submit sitemap in Google Search Console
