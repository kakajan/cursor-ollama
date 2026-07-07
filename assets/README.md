# Assets

| File | Use |
|------|-----|
| `logo.svg` | **Vector source** — wizard UI + landing nav logo (synced to `docs/` and `installer/wizard/`) |
| `logo.png` | **Raster source** — favicon + `.ico` / tray PNG generation |
| `logo.ico` | Windows system tray + shortcuts + installer (from `logo.png`) |
| `tray-icon.png` | macOS/Linux system tray (64×64, from `logo.png`) |
| `logo.png` (in `docs/`, `installer/wizard/`) | Favicon (32×32, from `assets/logo.png`) |
| `cursor-ollama.png` | Legacy/alternate artwork (not used by tray/favicon) |

Regenerate `.ico` and sync web/wizard SVG **without modifying** `logo.png`:

```bash
python scripts/regenerate-tray-icons.py
```
