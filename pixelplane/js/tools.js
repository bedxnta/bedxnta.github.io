// PixelPlane Tools Registry
import { ImageEngine } from "./image-engine.js";

export const TOOLS = {
  compress: {
    id: "compress",
    title: "Compress Image",
    category: "optimize",
    badgeTone: "icon-coral",
    badgeLabel: "OPTIMIZE",
    description: "Shrink image file size with smart quality control.",
    searchTerms: "compress shrink optimize reduce filesize webp jpg png quality",
    accept: "image/*",
    multiple: true,
    hint: "PNG, JPG, WebP · Single or Batch",
    actionLabel: "Compress & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6m-6 0 3-3m-3 3 3 3M20 10h-6m6 0-3-3m3 3-3 3"/><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`,
    renderControls(container, items) {
      const firstItem = items[0];
      container.innerHTML = `
        <div class="control-group">
          <div class="control-header">
            <label class="control-label" for="compress-quality">Compression Quality</label>
            <span class="control-value" id="quality-val">80%</span>
          </div>
          <input class="slider-input" id="compress-quality" type="range" min="10" max="98" value="80" />
          <div class="slider-ticks"><span>Maximum compression</span><span>Balanced</span><span>Best quality</span></div>
        </div>

        <div class="control-grid-2">
          <div class="control-group">
            <label class="control-label" for="compress-format">Output Format</label>
            <select class="select-input" id="compress-format">
              <option value="image/webp" selected>WebP (Recommended - Smallest)</option>
              <option value="image/jpeg">JPEG (Universal)</option>
              <option value="image/png">PNG (Lossless / Transparent)</option>
            </select>
          </div>
          <div class="control-group">
            <label class="control-label" for="compress-max-dim">Max Dimension</label>
            <select class="select-input" id="compress-max-dim">
              <option value="original" selected>Original Dimensions</option>
              <option value="2560">2560px (2K QHD)</option>
              <option value="1920">1920px (Full HD)</option>
              <option value="1280">1280px (HD)</option>
              <option value="800">800px (Web Optimized)</option>
            </select>
          </div>
        </div>

        <div class="metrics-card" id="compress-metrics">
          <div class="metric-item">
            <span class="metric-label">Original Size</span>
            <span class="metric-value">${ImageEngine.formatBytes(firstItem.size)}</span>
          </div>
          <div class="metric-divider">→</div>
          <div class="metric-item">
            <span class="metric-label">Est. Compressed Size</span>
            <span class="metric-value text-accent" id="est-size">Calculating...</span>
          </div>
          <div class="metric-badge" id="est-badge">~60% smaller</div>
        </div>
      `;

      const qualitySlider = container.querySelector("#compress-quality");
      const qualityVal = container.querySelector("#quality-val");
      const formatSelect = container.querySelector("#compress-format");
      const maxDimSelect = container.querySelector("#compress-max-dim");
      const estSize = container.querySelector("#est-size");
      const estBadge = container.querySelector("#est-badge");

      async function updateEstimate() {
        const q = parseInt(qualitySlider.value, 10) / 100;
        qualityVal.textContent = `${qualitySlider.value}%`;
        const fmt = formatSelect.value;
        const maxD = maxDimSelect.value === "original" ? null : parseInt(maxDimSelect.value, 10);

        try {
          const res = await ImageEngine.compress(firstItem, {
            quality: q,
            format: fmt,
            maxWidth: maxD,
            maxHeight: maxD
          });
          estSize.textContent = ImageEngine.formatBytes(res.size);
          const pct = Math.round(((firstItem.size - res.size) / firstItem.size) * 100);
          if (pct >= 0) {
            estBadge.textContent = `~${pct}% smaller`;
            estBadge.className = "metric-badge badge-green";
          } else {
            estBadge.textContent = `+${Math.abs(pct)}% (lossless)`;
            estBadge.className = "metric-badge badge-neutral";
          }
        } catch (e) {
          estSize.textContent = "Ready";
        }
      }

      qualitySlider.addEventListener("input", updateEstimate);
      formatSelect.addEventListener("change", updateEstimate);
      maxDimSelect.addEventListener("change", updateEstimate);
      updateEstimate();
    },
    async process(items, container) {
      const q = parseInt(container.querySelector("#compress-quality").value, 10) / 100;
      const fmt = container.querySelector("#compress-format").value;
      const maxDimVal = container.querySelector("#compress-max-dim").value;
      const maxD = maxDimVal === "original" ? null : parseInt(maxDimVal, 10);
      const ext = fmt === "image/webp" ? "webp" : fmt === "image/jpeg" ? "jpg" : "png";

      const results = [];
      for (const item of items) {
        const res = await ImageEngine.compress(item, {
          quality: q,
          format: fmt,
          maxWidth: maxD,
          maxHeight: maxD
        });
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        ImageEngine.download(res.blob, `${baseName}-compressed.${ext}`);
        results.push(res);
      }
      return results;
    }
  },

  resize: {
    id: "resize",
    title: "Resize Image",
    category: "transform",
    badgeTone: "icon-cobalt",
    badgeLabel: "TRANSFORM",
    description: "Scale dimensions with aspect ratio lock and presets.",
    searchTerms: "resize scale dimensions width height pixels 4k 1080p",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Resize & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      const ratio = item.width / item.height;

      container.innerHTML = `
        <div class="control-group">
          <label class="control-label">Quick Presets</label>
          <div class="preset-pills">
            <button type="button" class="preset-pill" data-w="${item.width}" data-h="${item.height}">Original</button>
            <button type="button" class="preset-pill" data-scale="0.5">50%</button>
            <button type="button" class="preset-pill" data-scale="0.25">25%</button>
            <button type="button" class="preset-pill" data-w="1080" data-h="1080">Instagram 1:1</button>
            <button type="button" class="preset-pill" data-w="1080" data-h="1920">Story 9:16</button>
            <button type="button" class="preset-pill" data-w="1280" data-h="720">YouTube 720p</button>
            <button type="button" class="preset-pill" data-w="1920" data-h="1080">Full HD 1080p</button>
          </div>
        </div>

        <div class="dimensions-lock-row">
          <div class="control-group">
            <label class="control-label" for="resize-w">Width (px)</label>
            <input class="text-input" id="resize-w" type="number" min="1" max="10000" value="${item.width}" />
          </div>

          <button type="button" class="aspect-lock-btn active" id="aspect-lock" title="Maintain aspect ratio" aria-label="Toggle aspect ratio lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>

          <div class="control-group">
            <label class="control-label" for="resize-h">Height (px)</label>
            <input class="text-input" id="resize-h" type="number" min="1" max="10000" value="${item.height}" />
          </div>
        </div>

        <div class="control-grid-2">
          <div class="control-group">
            <label class="control-label" for="resize-format">Export Format</label>
            <select class="select-input" id="resize-format">
              <option value="original" selected>Same as original</option>
              <option value="image/webp">WebP</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
          </div>
          <div class="control-group">
            <label class="control-label">Aspect Ratio</label>
            <div class="static-pill">${(ratio).toFixed(2)} : 1</div>
          </div>
        </div>
      `;

      const wInput = container.querySelector("#resize-w");
      const hInput = container.querySelector("#resize-h");
      const lockBtn = container.querySelector("#aspect-lock");
      let locked = true;

      lockBtn.addEventListener("click", () => {
        locked = !locked;
        lockBtn.classList.toggle("active", locked);
      });

      wInput.addEventListener("input", () => {
        if (locked && wInput.value) {
          hInput.value = Math.max(1, Math.round(parseInt(wInput.value, 10) / ratio));
        }
      });

      hInput.addEventListener("input", () => {
        if (locked && hInput.value) {
          wInput.value = Math.max(1, Math.round(parseInt(hInput.value, 10) * ratio));
        }
      });

      container.querySelectorAll(".preset-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          if (pill.dataset.scale) {
            const scale = parseFloat(pill.dataset.scale);
            wInput.value = Math.round(item.width * scale);
            hInput.value = Math.round(item.height * scale);
          } else if (pill.dataset.w) {
            wInput.value = pill.dataset.w;
            hInput.value = pill.dataset.h;
          }
        });
      });
    },
    async process(items, container) {
      const item = items[0];
      const w = parseInt(container.querySelector("#resize-w").value, 10);
      const h = parseInt(container.querySelector("#resize-h").value, 10);
      const fmtVal = container.querySelector("#resize-format").value;
      const fmt = fmtVal === "original" ? item.type : fmtVal;
      const ext = fmt === "image/webp" ? "webp" : fmt === "image/jpeg" ? "jpg" : "png";

      const res = await ImageEngine.resize(item, {
        width: w,
        height: h,
        maintainAspect: false,
        format: fmt
      });

      const baseName = item.name.replace(/\.[^/.]+$/, "");
      ImageEngine.download(res.blob, `${baseName}-${w}x${h}.${ext}`);
      return [res];
    }
  },

  crop: {
    id: "crop",
    title: "Crop Image",
    category: "transform",
    badgeTone: "icon-mint",
    badgeLabel: "TRANSFORM",
    description: "Trim and reframe with aspect ratio presets.",
    searchTerms: "crop trim cut frame square aspect ratio 16:9",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Crop & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      container.innerHTML = `
        <div class="control-group">
          <label class="control-label">Aspect Ratio Presets</label>
          <div class="preset-pills" id="crop-presets">
            <button type="button" class="preset-pill active" data-ratio="free">Freeform</button>
            <button type="button" class="preset-pill" data-ratio="1:1">1:1 Square</button>
            <button type="button" class="preset-pill" data-ratio="16:9">16:9 Landscape</button>
            <button type="button" class="preset-pill" data-ratio="9:16">9:16 Story</button>
            <button type="button" class="preset-pill" data-ratio="4:3">4:3 Standard</button>
            <button type="button" class="preset-pill" data-ratio="3:2">3:2 Photo</button>
          </div>
        </div>

        <div class="crop-editor-wrapper">
          <div class="crop-canvas-container" id="crop-canvas-box">
            <canvas id="crop-canvas"></canvas>
            <div class="crop-overlay" id="crop-overlay">
              <div class="crop-box" id="crop-box">
                <div class="crop-handle handle-tl"></div>
                <div class="crop-handle handle-tr"></div>
                <div class="crop-handle handle-bl"></div>
                <div class="crop-handle handle-br"></div>
                <div class="crop-grid-rule"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="crop-info-bar">
          <span>Crop Box: <strong id="crop-dimensions">-- × --</strong></span>
          <span class="crop-help">Drag box to position or drag corner handles to resize</span>
        </div>
      `;

      const canvas = container.querySelector("#crop-canvas");
      const cropBox = container.querySelector("#crop-box");
      const cropContainer = container.querySelector("#crop-canvas-box");
      const dimDisplay = container.querySelector("#crop-dimensions");

      const ctx = canvas.getContext("2d");
      const maxW = 480;
      const scaleFactor = Math.min(1, maxW / item.width);
      const displayW = Math.round(item.width * scaleFactor);
      const displayH = Math.round(item.height * scaleFactor);

      canvas.width = displayW;
      canvas.height = displayH;
      ctx.drawImage(item.img, 0, 0, displayW, displayH);

      // Initial crop box at 80%
      let boxX = Math.round(displayW * 0.1);
      let boxY = Math.round(displayH * 0.1);
      let boxW = Math.round(displayW * 0.8);
      let boxH = Math.round(displayH * 0.8);
      let activeRatio = "free";

      function updateBoxUI() {
        boxX = Math.max(0, Math.min(boxX, displayW - boxW));
        boxY = Math.max(0, Math.min(boxY, displayH - boxH));
        boxW = Math.max(20, Math.min(boxW, displayW - boxX));
        boxH = Math.max(20, Math.min(boxH, displayH - boxY));

        cropBox.style.left = `${boxX}px`;
        cropBox.style.top = `${boxY}px`;
        cropBox.style.width = `${boxW}px`;
        cropBox.style.height = `${boxH}px`;

        const realW = Math.round(boxW / scaleFactor);
        const realH = Math.round(boxH / scaleFactor);
        dimDisplay.textContent = `${realW} × ${realH} px`;

        container._cropData = {
          x: Math.round(boxX / scaleFactor),
          y: Math.round(boxY / scaleFactor),
          width: realW,
          height: realH
        };
      }

      function setRatio(ratioStr) {
        activeRatio = ratioStr;
        if (ratioStr === "free") return;
        const [rw, rh] = ratioStr.split(":").map(Number);
        const targetR = rw / rh;
        let newW = boxW;
        let newH = Math.round(newW / targetR);
        if (newH > displayH) {
          newH = displayH - 10;
          newW = Math.round(newH * targetR);
        }
        if (newW > displayW) {
          newW = displayW - 10;
          newH = Math.round(newW / targetR);
        }
        boxW = newW;
        boxH = newH;
        updateBoxUI();
      }

      container.querySelectorAll("#crop-presets .preset-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          container.querySelectorAll("#crop-presets .preset-pill").forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          setRatio(pill.dataset.ratio);
        });
      });

      // Draggable crop box
      let isDragging = false;
      let startX, startY, initBoxX, initBoxY;

      cropBox.addEventListener("pointerdown", (e) => {
        if (e.target.classList.contains("crop-handle")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initBoxX = boxX;
        initBoxY = boxY;
        cropBox.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      cropBox.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        boxX = initBoxX + dx;
        boxY = initBoxY + dy;
        updateBoxUI();
      });

      cropBox.addEventListener("pointerup", (e) => {
        isDragging = false;
        try { cropBox.releasePointerCapture(e.pointerId); } catch (_) {}
      });

      // Corner handles
      container.querySelectorAll(".crop-handle").forEach((handle) => {
        let isResizing = false;
        let hStartX, hStartY, initW, initH, initX, initY;
        const isBr = handle.classList.contains("handle-br");
        const isBl = handle.classList.contains("handle-bl");
        const isTr = handle.classList.contains("handle-tr");
        const isTl = handle.classList.contains("handle-tl");

        handle.addEventListener("pointerdown", (e) => {
          isResizing = true;
          hStartX = e.clientX;
          hStartY = e.clientY;
          initW = boxW;
          initH = boxH;
          initX = boxX;
          initY = boxY;
          handle.setPointerCapture(e.pointerId);
          e.stopPropagation();
          e.preventDefault();
        });

        handle.addEventListener("pointermove", (e) => {
          if (!isResizing) return;
          const dx = e.clientX - hStartX;
          const dy = e.clientY - hStartY;

          if (isBr) {
            boxW = initW + dx;
            boxH = activeRatio !== "free" ? Math.round(boxW / (boxW / boxH)) : initH + dy;
          } else if (isBl) {
            const newW = initW - dx;
            boxX = initX + (initW - newW);
            boxW = newW;
            boxH = initH + dy;
          } else if (isTr) {
            boxW = initW + dx;
            const newH = initH - dy;
            boxY = initY + (initH - newH);
            boxH = newH;
          } else if (isTl) {
            const newW = initW - dx;
            const newH = initH - dy;
            boxX = initX + (initW - newW);
            boxY = initY + (initH - newH);
            boxW = newW;
            boxH = newH;
          }
          updateBoxUI();
        });

        handle.addEventListener("pointerup", (e) => {
          isResizing = false;
          try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        });
      });

      updateBoxUI();
    },
    async process(items, container) {
      const item = items[0];
      const cropData = container._cropData;
      const res = await ImageEngine.crop(item, cropData, {
        format: item.type
      });
      const baseName = item.name.replace(/\.[^/.]+$/, "");
      ImageEngine.download(res.blob, `${baseName}-cropped.png`);
      return [res];
    }
  },

  convert: {
    id: "convert",
    title: "Convert Format",
    category: "convert",
    badgeTone: "icon-amber",
    badgeLabel: "CONVERT",
    description: "Convert between PNG, JPG, WebP, AVIF, and BMP.",
    searchTerms: "convert format change extension png jpg jpeg webp avif bmp",
    accept: "image/*",
    multiple: true,
    hint: "PNG, JPG, WebP, AVIF, BMP · Single or Batch",
    actionLabel: "Convert & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6M3 17v-6h6"/><path d="M3 17l6-6M21 7l-6 6"/></svg>`,
    async renderControls(container, items) {
      container.innerHTML = `
        <div class="control-group">
          <label class="control-label" for="convert-target">Target Format</label>
          <select class="select-input" id="convert-target">
            <option value="image/webp" selected>WEBP — Best web performance & compression</option>
            <option value="image/jpeg">JPEG — Universal compatibility & photos</option>
            <option value="image/png">PNG — High fidelity with transparency</option>
            <option value="image/avif">AVIF — Next-gen compression efficiency</option>
            <option value="image/bmp">BMP — Uncompressed Windows Bitmap (built-in encoder)</option>
          </select>
        </div>

        <div class="control-group" id="convert-quality-group">
          <div class="control-header">
            <label class="control-label" for="convert-quality">Quality</label>
            <span class="control-value" id="convert-quality-val">90%</span>
          </div>
          <input class="slider-input" id="convert-quality" type="range" min="20" max="100" value="90" />
        </div>

        <div class="control-group" id="convert-fill-group">
          <label class="control-label" for="convert-fill">Background fill (for formats without alpha transparency)</label>
          <div class="color-picker-row">
            <input type="color" id="convert-fill" value="#ffffff" />
            <span class="color-label">Solid White (prevents transparent areas from turning black)</span>
          </div>
        </div>

        <div class="info-note" id="convert-info-note">
          <span class="note-icon">💡</span>
          <span id="convert-note-text">WebP files are typically 30-50% smaller than JPEGs while retaining identical visual sharpness.</span>
        </div>
      `;

      const targetSelect = container.querySelector("#convert-target");
      const qualityGroup = container.querySelector("#convert-quality-group");
      const qualitySlider = container.querySelector("#convert-quality");
      const qualityVal = container.querySelector("#convert-quality-val");
      const fillGroup = container.querySelector("#convert-fill-group");
      const noteText = container.querySelector("#convert-note-text");

      const avifSupported = await ImageEngine.checkFormatSupport("image/avif");

      qualitySlider.addEventListener("input", () => {
        qualityVal.textContent = `${qualitySlider.value}%`;
      });

      function updateFormatUI() {
        const val = targetSelect.value;
        const isLosslessOrUncompressed = val === "image/png" || val === "image/bmp";
        qualityGroup.style.display = isLosslessOrUncompressed ? "none" : "block";

        const needsFill = val === "image/jpeg" || val === "image/bmp";
        fillGroup.style.display = needsFill ? "block" : "none";

        if (val === "image/avif") {
          noteText.textContent = avifSupported
            ? "Your browser natively supports AVIF encoding! Output will be high-efficiency AVIF."
            : "Note: Your current browser engine lacks native AVIF canvas export; it will gracefully fall back to high-quality WebP.";
        } else if (val === "image/bmp") {
          noteText.textContent = "BMP creates a standard 24-bit uncompressed Windows bitmap via PixelPlane's built-in encoder.";
        } else if (val === "image/webp") {
          noteText.textContent = "WebP files are typically 30-50% smaller than JPEGs while retaining identical visual sharpness.";
        } else if (val === "image/jpeg") {
          noteText.textContent = "JPEG is universally compatible across all devices, platforms, and photo viewers.";
        } else if (val === "image/png") {
          noteText.textContent = "PNG is a lossless format that fully preserves translucent and transparent pixels.";
        }
      }

      targetSelect.addEventListener("change", updateFormatUI);
      updateFormatUI();
    },
    async process(items, container) {
      const targetFormat = container.querySelector("#convert-target").value;
      const quality = parseInt(container.querySelector("#convert-quality").value, 10) / 100;
      const fillColor = container.querySelector("#convert-fill").value;

      const extMap = {
        "image/webp": "webp",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/avif": "avif",
        "image/bmp": "bmp"
      };
      const ext = extMap[targetFormat] || "png";

      const results = [];
      for (const item of items) {
        const res = await ImageEngine.convert(item, {
          targetFormat,
          quality,
          fillColor
        });
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        ImageEngine.download(res.blob, `${baseName}.${ext}`);
        results.push(res);
      }
      return results;
    }
  },

  "rotate-flip": {
    id: "rotate-flip",
    title: "Rotate & Flip",
    category: "transform",
    badgeTone: "icon-purple",
    badgeLabel: "TRANSFORM",
    description: "Turn, spin, or mirror images in any direction.",
    searchTerms: "rotate flip mirror orientation turn vertical horizontal",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Save & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-1.19"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      let angle = 0;
      let flipH = false;
      let flipV = false;

      container.innerHTML = `
        <div class="control-group">
          <label class="control-label">Transform Operations</label>
          <div class="action-btn-row">
            <button type="button" class="action-btn" id="btn-rot-cw">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-1.19"/></svg>
              90° Clockwise
            </button>
            <button type="button" class="action-btn" id="btn-rot-ccw">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38L2.5 8"/></svg>
              90° Counter-CW
            </button>
            <button type="button" class="action-btn" id="btn-flip-h">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M5 7l-3 5 3 5M19 7l3 5-3 5"/></svg>
              Flip Horizontal
            </button>
            <button type="button" class="action-btn" id="btn-flip-v">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M7 5l5-3 5 3M7 19l5 3 5-3"/></svg>
              Flip Vertical
            </button>
          </div>
        </div>

        <div class="preview-box">
          <canvas id="rotate-canvas"></canvas>
        </div>

        <div class="status-summary">
          <span>Angle: <strong id="angle-val">0°</strong></span>
          <span>Horizontal Flip: <strong id="fliph-val">No</strong></span>
          <span>Vertical Flip: <strong id="flipv-val">No</strong></span>
        </div>
      `;

      const canvas = container.querySelector("#rotate-canvas");
      const ctx = canvas.getContext("2d");
      const angleVal = container.querySelector("#angle-val");
      const fliphVal = container.querySelector("#fliph-val");
      const flipvVal = container.querySelector("#flipv-val");

      function updatePreview() {
        const isRotated = angle % 180 !== 0;
        const curW = isRotated ? item.height : item.width;
        const curH = isRotated ? item.width : item.height;

        const maxSide = 400;
        const scale = Math.min(1, maxSide / Math.max(curW, curH));
        const dispW = Math.round(curW * scale);
        const dispH = Math.round(curH * scale);

        canvas.width = dispW;
        canvas.height = dispH;

        ctx.save();
        ctx.translate(dispW / 2, dispH / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(
          item.img,
          (-item.width * scale) / 2,
          (-item.height * scale) / 2,
          item.width * scale,
          item.height * scale
        );
        ctx.restore();

        angleVal.textContent = `${angle}°`;
        fliphVal.textContent = flipH ? "Yes" : "No";
        flipvVal.textContent = flipV ? "Yes" : "No";

        container._transformData = { angle, flipH, flipV };
      }

      container.querySelector("#btn-rot-cw").addEventListener("click", () => {
        angle = (angle + 90) % 360;
        updatePreview();
      });

      container.querySelector("#btn-rot-ccw").addEventListener("click", () => {
        angle = (angle + 270) % 360;
        updatePreview();
      });

      container.querySelector("#btn-flip-h").addEventListener("click", () => {
        flipH = !flipH;
        updatePreview();
      });

      container.querySelector("#btn-flip-v").addEventListener("click", () => {
        flipV = !flipV;
        updatePreview();
      });

      updatePreview();
    },
    async process(items, container) {
      const item = items[0];
      const { angle, flipH, flipV } = container._transformData || { angle: 0, flipH: false, flipV: false };
      const res = await ImageEngine.transform(item, {
        angle,
        flipH,
        flipV,
        format: item.type
      });
      const baseName = item.name.replace(/\.[^/.]+$/, "");
      ImageEngine.download(res.blob, `${baseName}-transformed.png`);
      return [res];
    }
  },

  watermark: {
    id: "watermark",
    title: "Watermark & Stamp",
    category: "optimize",
    badgeTone: "icon-mint",
    badgeLabel: "CREATIVE",
    description: "Add copyright text or custom stamps to images.",
    searchTerms: "watermark text stamp signature copyright branding overlay",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Apply & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      container.innerHTML = `
        <div class="control-group">
          <label class="control-label" for="wm-text">Watermark Text</label>
          <input class="text-input" id="wm-text" type="text" value="© PixelPlane" maxlength="80" placeholder="e.g. © 2026 Studio" />
        </div>

        <div class="control-grid-2">
          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="wm-size">Font Size</label>
              <span class="control-value" id="wm-size-val">36px</span>
            </div>
            <input class="slider-input" id="wm-size" type="range" min="16" max="140" value="36" />
          </div>

          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="wm-opacity">Opacity</label>
              <span class="control-value" id="wm-opacity-val">70%</span>
            </div>
            <input class="slider-input" id="wm-opacity" type="range" min="10" max="100" value="70" />
          </div>
        </div>

        <div class="control-grid-2">
          <div class="control-group">
            <label class="control-label">Position Alignment</label>
            <div class="position-grid" id="wm-position-grid">
              <button type="button" class="pos-cell" data-pos="top-left" title="Top Left">↖</button>
              <button type="button" class="pos-cell" data-pos="center" title="Center">✦</button>
              <button type="button" class="pos-cell" data-pos="top-right" title="Top Right">↗</button>
              <button type="button" class="pos-cell" data-pos="bottom-left" title="Bottom Left">↙</button>
              <button type="button" class="pos-cell active" data-pos="bottom-right" title="Bottom Right">↘</button>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label" for="wm-color">Text Color</label>
            <div class="color-picker-row">
              <input type="color" id="wm-color" value="#ffffff" />
              <span class="color-label">High contrast fill</span>
            </div>
          </div>
        </div>

        <div class="preview-box">
          <canvas id="wm-canvas"></canvas>
        </div>
      `;

      const canvas = container.querySelector("#wm-canvas");
      const ctx = canvas.getContext("2d");
      const textInput = container.querySelector("#wm-text");
      const sizeInput = container.querySelector("#wm-size");
      const sizeVal = container.querySelector("#wm-size-val");
      const opInput = container.querySelector("#wm-opacity");
      const opVal = container.querySelector("#wm-opacity-val");
      const colorInput = container.querySelector("#wm-color");
      let activePos = "bottom-right";

      container.querySelectorAll(".pos-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          container.querySelectorAll(".pos-cell").forEach((c) => c.classList.remove("active"));
          cell.classList.add("active");
          activePos = cell.dataset.pos;
          updatePreview();
        });
      });

      async function updatePreview() {
        sizeVal.textContent = `${sizeInput.value}px`;
        opVal.textContent = `${opInput.value}%`;

        const maxSide = 420;
        const scale = Math.min(1, maxSide / Math.max(item.width, item.height));
        const dispW = Math.round(item.width * scale);
        const dispH = Math.round(item.height * scale);

        canvas.width = dispW;
        canvas.height = dispH;
        ctx.drawImage(item.img, 0, 0, dispW, dispH);

        const scaledFont = Math.max(12, Math.round(parseInt(sizeInput.value, 10) * scale));
        ctx.save();
        ctx.globalAlpha = parseInt(opInput.value, 10) / 100;
        ctx.font = `bold ${scaledFont}px sans-serif`;
        ctx.fillStyle = colorInput.value;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.textBaseline = "middle";

        const text = textInput.value || "";
        const m = ctx.measureText(text);
        const margin = Math.round(scaledFont * 0.7);

        let tx = margin;
        let ty = margin + scaledFont / 2;
        if (activePos === "top-right") {
          tx = dispW - m.width - margin;
        } else if (activePos === "center") {
          tx = (dispW - m.width) / 2;
          ty = dispH / 2;
        } else if (activePos === "bottom-left") {
          ty = dispH - margin - scaledFont / 2;
        } else if (activePos === "bottom-right") {
          tx = dispW - m.width - margin;
          ty = dispH - margin - scaledFont / 2;
        }

        ctx.fillText(text, tx, ty);
        ctx.restore();
      }

      textInput.addEventListener("input", updatePreview);
      sizeInput.addEventListener("input", updatePreview);
      opInput.addEventListener("input", updatePreview);
      colorInput.addEventListener("input", updatePreview);
      updatePreview();
    },
    async process(items, container) {
      const item = items[0];
      const text = container.querySelector("#wm-text").value;
      const fontSize = parseInt(container.querySelector("#wm-size").value, 10);
      const opacity = parseInt(container.querySelector("#wm-opacity").value, 10) / 100;
      const color = container.querySelector("#wm-color").value;
      const activeCell = container.querySelector(".pos-cell.active");
      const position = activeCell ? activeCell.dataset.pos : "bottom-right";

      const res = await ImageEngine.watermark(item, {
        text,
        fontSize,
        opacity,
        color,
        position,
        format: item.type
      });

      const baseName = item.name.replace(/\.[^/.]+$/, "");
      ImageEngine.download(res.blob, `${baseName}-watermarked.png`);
      return [res];
    }
  },

  adjust: {
    id: "adjust",
    title: "Adjust & Filter",
    category: "transform",
    badgeTone: "icon-coral",
    badgeLabel: "CREATIVE",
    description: "Tune brightness, contrast, saturation, and tone.",
    searchTerms: "brightness contrast saturation filters tone grayscale sepia exposure",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Export Enhanced Image",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20Z"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      container.innerHTML = `
        <div class="control-grid-2">
          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="adj-bright">Brightness</label>
              <span class="control-value" id="val-bright">100%</span>
            </div>
            <input class="slider-input" id="adj-bright" type="range" min="30" max="170" value="100" />
          </div>

          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="adj-contrast">Contrast</label>
              <span class="control-value" id="val-contrast">100%</span>
            </div>
            <input class="slider-input" id="adj-contrast" type="range" min="30" max="170" value="100" />
          </div>
        </div>

        <div class="control-grid-2">
          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="adj-sat">Saturation</label>
              <span class="control-value" id="val-sat">100%</span>
            </div>
            <input class="slider-input" id="adj-sat" type="range" min="0" max="200" value="100" />
          </div>

          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="adj-blur">Soft Blur</label>
              <span class="control-value" id="val-blur">0px</span>
            </div>
            <input class="slider-input" id="adj-blur" type="range" min="0" max="12" value="0" />
          </div>
        </div>

        <div class="filter-quick-pills">
          <button type="button" class="preset-pill" id="filter-reset">Reset All</button>
          <button type="button" class="preset-pill" id="filter-bw">B&W Monochrome</button>
          <button type="button" class="preset-pill" id="filter-warm">Warm Vintage</button>
          <button type="button" class="preset-pill" id="filter-pop">Color Pop</button>
        </div>

        <div class="preview-box">
          <canvas id="adjust-canvas"></canvas>
        </div>
      `;

      const canvas = container.querySelector("#adjust-canvas");
      const ctx = canvas.getContext("2d");
      const bIn = container.querySelector("#adj-bright");
      const cIn = container.querySelector("#adj-contrast");
      const sIn = container.querySelector("#adj-sat");
      const blurIn = container.querySelector("#adj-blur");

      const bVal = container.querySelector("#val-bright");
      const cVal = container.querySelector("#val-contrast");
      const sVal = container.querySelector("#val-sat");
      const blurVal = container.querySelector("#val-blur");

      let grayscaleVal = 0;
      let sepiaVal = 0;

      function updatePreview() {
        bVal.textContent = `${bIn.value}%`;
        cVal.textContent = `${cIn.value}%`;
        sVal.textContent = `${sIn.value}%`;
        blurVal.textContent = `${blurIn.value}px`;

        const maxSide = 420;
        const scale = Math.min(1, maxSide / Math.max(item.width, item.height));
        const dispW = Math.round(item.width * scale);
        const dispH = Math.round(item.height * scale);

        canvas.width = dispW;
        canvas.height = dispH;

        ctx.filter = `brightness(${bIn.value}%) contrast(${cIn.value}%) saturate(${sIn.value}%) grayscale(${grayscaleVal}%) sepia(${sepiaVal}%) blur(${blurIn.value}px)`;
        ctx.drawImage(item.img, 0, 0, dispW, dispH);
      }

      [bIn, cIn, sIn, blurIn].forEach((input) => input.addEventListener("input", updatePreview));

      container.querySelector("#filter-reset").addEventListener("click", () => {
        bIn.value = 100;
        cIn.value = 100;
        sIn.value = 100;
        blurIn.value = 0;
        grayscaleVal = 0;
        sepiaVal = 0;
        updatePreview();
      });

      container.querySelector("#filter-bw").addEventListener("click", () => {
        grayscaleVal = 100;
        sepiaVal = 0;
        cIn.value = 120;
        updatePreview();
      });

      container.querySelector("#filter-warm").addEventListener("click", () => {
        sepiaVal = 40;
        grayscaleVal = 0;
        bIn.value = 105;
        sIn.value = 110;
        updatePreview();
      });

      container.querySelector("#filter-pop").addEventListener("click", () => {
        grayscaleVal = 0;
        sepiaVal = 0;
        sIn.value = 145;
        cIn.value = 115;
        updatePreview();
      });

      updatePreview();
    },
    async process(items, container) {
      const item = items[0];
      const brightness = parseInt(container.querySelector("#adj-bright").value, 10);
      const contrast = parseInt(container.querySelector("#adj-contrast").value, 10);
      const saturation = parseInt(container.querySelector("#adj-sat").value, 10);
      const blur = parseInt(container.querySelector("#adj-blur").value, 10);

      const res = await ImageEngine.adjust(item, {
        brightness,
        contrast,
        saturation,
        blur,
        format: item.type
      });

      const baseName = item.name.replace(/\.[^/.]+$/, "");
      ImageEngine.download(res.blob, `${baseName}-adjusted.png`);
      return [res];
    }
  },

  "strip-exif": {
    id: "strip-exif",
    title: "Clean & Strip EXIF",
    category: "privacy",
    badgeTone: "icon-mint",
    badgeLabel: "PRIVACY",
    description: "Remove GPS tags, camera serials, and hidden metadata.",
    searchTerms: "exif metadata privacy clean strip gps camera tags privacy protect",
    accept: "image/*",
    multiple: true,
    hint: "PNG, JPG, WebP · Single or Batch",
    actionLabel: "Sanitize & Download",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    renderControls(container, items) {
      const firstItem = items[0];
      container.innerHTML = `
        <div class="privacy-banner">
          <div class="privacy-shield-icon">🛡️</div>
          <div>
            <strong>100% In-Browser Metadata Sanitization</strong>
            <p>Removes GPS coordinates, device serial numbers, camera model, lens parameters, date stamps, and proprietary thumbnail caches.</p>
          </div>
        </div>

        <div class="audit-list">
          <div class="audit-row"><span class="audit-name">File Name</span><span class="audit-val">${firstItem.name}</span></div>
          <div class="audit-row"><span class="audit-name">Resolution</span><span class="audit-val">${firstItem.width} × ${firstItem.height} px</span></div>
          <div class="audit-row"><span class="audit-name">Original Size</span><span class="audit-val">${ImageEngine.formatBytes(firstItem.size)}</span></div>
          <div class="audit-row"><span class="audit-name">EXIF & GPS Status</span><span class="audit-badge">Will be stripped completely</span></div>
        </div>
      `;
    },
    async process(items) {
      const results = [];
      for (const item of items) {
        const res = await ImageEngine.stripMetadata(item, { format: item.type });
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        ImageEngine.download(res.blob, `${baseName}-clean.jpg`);
        results.push(res);
      }
      return results;
    }
  },

  palette: {
    id: "palette",
    title: "Color Palette Extractor",
    category: "optimize",
    badgeTone: "icon-amber",
    badgeLabel: "CREATIVE",
    description: "Extract the dominant harmonious color scheme.",
    searchTerms: "color palette extractor hex rgb swatches dominant colors scheme",
    accept: "image/*",
    multiple: false,
    hint: "PNG, JPG, WebP · Single image",
    actionLabel: "Copy Hex Codes",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/></svg>`,
    renderControls(container, items) {
      const item = items[0];
      const colors = ImageEngine.extractPalette(item, 6);
      container._colors = colors;

      container.innerHTML = `
        <div class="control-group">
          <label class="control-label">Dominant Color Swatches (Click to copy)</label>
          <div class="swatches-grid" id="palette-swatches">
            ${colors
              .map(
                (c) => `
              <div class="swatch-card" data-hex="${c.hex}" title="Click to copy ${c.hex}">
                <div class="swatch-color" style="background-color: ${c.hex}"></div>
                <div class="swatch-hex">${c.hex.toUpperCase()}</div>
                <div class="swatch-rgb">${c.rgb}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="info-note" id="copy-status-note">
          <span class="note-icon">✨</span>
          <span>Click any color swatch to instantly copy its HEX code to your clipboard.</span>
        </div>
      `;

      container.querySelectorAll(".swatch-card").forEach((card) => {
        card.addEventListener("click", async () => {
          const hex = card.dataset.hex;
          await navigator.clipboard.writeText(hex);
          const note = container.querySelector("#copy-status-note");
          note.innerHTML = `<span class="note-icon">✓</span> <span>Copied <strong>${hex.toUpperCase()}</strong> to clipboard!</span>`;
          card.classList.add("copied");
          setTimeout(() => card.classList.remove("copied"), 1000);
        });
      });
    },
    async process(items, container) {
      const colors = container._colors || [];
      const text = colors.map((c) => `${c.hex.toUpperCase()} (${c.rgb})`).join("\n");
      await navigator.clipboard.writeText(text);
      return [{ message: "Palette copied to clipboard!" }];
    }
  }
};
