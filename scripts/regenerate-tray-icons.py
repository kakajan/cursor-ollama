#!/usr/bin/env python3
"""Build logo.ico from assets/logo.png; sync logo.svg to docs and wizard."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
DOCS = ROOT / 'docs'
ICON_PNG = ASSETS / 'logo.png'
ICON_ICO = ASSETS / 'logo.ico'
TRAY_ICON_PNG = ASSETS / 'tray-icon.png'
ICON_SVG = ASSETS / 'logo.svg'
DOCS_ICON = DOCS / 'logo.svg'
DOCS_FAVICON = DOCS / 'logo.png'
WIZARD_ICON = ROOT / 'installer' / 'wizard' / 'logo.svg'
WIZARD_FAVICON = ROOT / 'installer' / 'wizard' / 'logo.png'
ICO_MAX_DIMS = [16, 24, 32, 48, 64, 128, 256]
TRAY_PNG_DIM = 64
FAVICON_DIM = 32


def fit_within(base: Image.Image, max_dim: int) -> Image.Image:
    """Scale down preserving aspect ratio; max(width, height) == max_dim."""
    w, h = base.size
    scale = max_dim / max(w, h)
    new_w = max(1, round(w * scale))
    new_h = max(1, round(h * scale))
    return base.resize((new_w, new_h), Image.Resampling.LANCZOS)


def build_ico(src: Image.Image, out: Path) -> None:
    base = src.convert('RGBA')
    imgs = [fit_within(base, max_dim) for max_dim in ICO_MAX_DIMS]
    imgs[-1].save(out, format='ICO', sizes=[(im.width, im.height) for im in imgs])


def build_tray_png(src: Image.Image, out: Path, max_dim: int) -> Image.Image:
    fitted = fit_within(src.convert('RGBA'), max_dim)
    canvas = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    x = (max_dim - fitted.width) // 2
    y = (max_dim - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    canvas.save(out, format='PNG')
    return canvas


def main() -> None:
    if not ICON_PNG.exists():
        raise SystemExit(f'Missing {ICON_PNG}')

    src = Image.open(ICON_PNG)
    build_ico(src, ICON_ICO)
    tray = build_tray_png(src, TRAY_ICON_PNG, TRAY_PNG_DIM)
    favicon = build_tray_png(src, DOCS_FAVICON, FAVICON_DIM)
    build_tray_png(src, WIZARD_FAVICON, FAVICON_DIM)

    if not ICON_SVG.exists():
        raise SystemExit(f'Missing {ICON_SVG}')

    DOCS.mkdir(parents=True, exist_ok=True)
    WIZARD_ICON.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ICON_SVG, DOCS_ICON)
    shutil.copy2(ICON_SVG, WIZARD_ICON)

    sample = fit_within(src.convert('RGBA'), 256)
    print(f'PNG unchanged: {ICON_PNG} ({src.size[0]}x{src.size[1]})')
    print(f'Wrote {ICON_ICO} ({len(ICO_MAX_DIMS)} sizes, e.g. 256px -> {sample.size[0]}x{sample.size[1]})')
    print(f'Wrote {TRAY_ICON_PNG} ({tray.size[0]}x{tray.size[1]})')
    print(f'Wrote {DOCS_FAVICON} ({favicon.size[0]}x{favicon.size[1]})')
    print(f'Wrote {WIZARD_FAVICON} ({FAVICON_DIM}x{FAVICON_DIM})')
    print(f'Copied {DOCS_ICON}')
    print(f'Copied {WIZARD_ICON}')


if __name__ == '__main__':
    main()
