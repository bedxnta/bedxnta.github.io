# PixelPlane — Modern Client-Side Image Toolkit

> A fast, private, zero-fuss in-browser image studio inspired by Paperplane's clean design philosophy, tailored specifically for modern image manipulation and optimization.

## ✦ Core Features

- **100% In-Browser & Private**: Zero server uploads. Every scaling, compression, and conversion operation runs locally on your machine using the HTML5 Canvas API and Web Workers.
- **Zero Build Step**: Pure modern vanilla web stack (HTML5, Modern CSS, and ES Modules) that runs instantly in any modern browser.
- **Dark & Light Mode**: Seamless theme switching with system detection and persistence via `localStorage`.
- **Snappy Search & Filters**: Instant keyboard-driven lookup with `/` or `Ctrl+K`, plus category tabs (`Optimize`, `Transform`, `Convert`, `Privacy`).
- **Clipboard Paste Support**: Press `Ctrl+V` anywhere on the page to paste an image directly from your clipboard into the workspace.
- **Live Interactive Previews**: Visual crop overlays, real-time compression size estimation, instant color swatch extraction, and live filter tuning.

---

## 🛠 Available Tools

| Tool | Category | Description |
| :--- | :--- | :--- |
| **Compress Image** | Optimize | Smart lossy/lossless compression with live size estimation and WebP/JPEG conversion. |
| **Resize Image** | Transform | Scale pixel dimensions with aspect ratio lock and social media presets (1:1, 9:16, 720p, 1080p). |
| **Crop Image** | Transform | Interactive canvas crop box with aspect ratio presets (Freeform, 1:1, 16:9, 9:16, 4:3, 3:2). |
| **Image Splitter** | Transform | Preview and split an image into a configurable rows-by-columns grid, then download all tiles together as a ZIP. |
| **Image Markup** | Transform | Draw colored brush strokes over an interactive image preview and undo strokes before downloading. |
| **Convert Format** | Convert | Switch between WebP, JPEG, and PNG with quality tuning and transparent background fill choice. |
| **Image to PDF** | Convert | Combine images into a multi-page PDF with A4 or US Letter pages, portrait or landscape orientation, and adjustable page order. |
| **Rotate & Flip** | Transform | 90° CW/CCW rotations, 180° turns, and horizontal/vertical mirroring. |
| **Watermark & Stamp** | Optimize | Text watermark overlay with font size, opacity, color picker, and 9-point anchor alignment. |
| **Adjust & Filter** | Transform | Tune brightness, contrast, saturation, soft blur, and quick presets (B&W, Warm Vintage, Color Pop). |
| **Clean & Strip EXIF** | Privacy | Strip all GPS coordinates, camera metadata, and device serial numbers cleanly in-browser. |
| **Palette Extractor** | Optimize | Extract the dominant harmonious color scheme with one-click HEX / RGB copy buttons. |

---

## 🚀 How to Run

Because PixelPlane uses standard ES Modules, it can be served using any local HTTP server or opened directly:

### Option 1: Python HTTP Server (Built-in)
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000/`

### Option 2: VS Code Live Server / npx serve
```bash
npx serve .
```

---

## 📁 Project Structure

```
├── index.html            # Studio application layout, tools directory & interactive modals
├── how-it-works.html     # Dedicated guide explaining the in-browser canvas pipeline & formats
├── privacy.html          # Detailed zero-upload privacy architecture & comparison matrix
├── favicon.svg           # Geometric brand icon
├── css/
│   └── styles.css        # Design tokens, hero art, content articles, and dark mode themes
├── js/
│   ├── theme.js          # Fast non-blocking theme initialization & toggle logic
│   ├── app.js            # Main application coordinator, shortcuts, and modal lifecycle
│   ├── tools.js          # Registry of all tool definitions, UI controls, and actions
│   └── image-engine.js   # HTML5 Canvas image processing pipeline
└── README.md             # Documentation
```
