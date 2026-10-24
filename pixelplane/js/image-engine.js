// PixelPlane Image Processing Engine
// 100% Client-Side In-Browser Operations via HTML5 Canvas

export class ImageEngine {
  /**
   * Load a File or Blob into an HTMLImageElement
   */
  static async load(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Please select a valid image file."));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            img,
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
            dataUrl: e.target.result,
            file
          });
        };
        img.onerror = () => reject(new Error("Failed to decode image data."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Could not read the selected file."));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Create an off-screen canvas with high quality smoothing
   */
  static createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { canvas, ctx };
  }

  /**
   * Pure JavaScript 24-bit BMP encoder for 100% universal browser support
   */
  static canvasToBmpBlob(canvas, fillColor = "#ffffff") {
    const width = canvas.width;
    const height = canvas.height;

    // Create a temporary canvas with solid background to handle transparency
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(canvas, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // BMP rows are padded to multiples of 4 bytes
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // BITMAPFILEHEADER (14 bytes)
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, fileSize, true); // File size
    view.setUint16(6, 0, true);        // Reserved
    view.setUint16(8, 0, true);
    view.setUint32(10, 54, true);      // Pixel array offset

    // BITMAPINFOHEADER (40 bytes)
    view.setUint32(14, 40, true);      // Header size
    view.setInt32(18, width, true);    // Width
    view.setInt32(22, height, true);   // Height (positive = bottom-up)
    view.setUint16(26, 1, true);       // Color planes
    view.setUint16(28, 24, true);      // 24-bit RGB
    view.setUint32(30, 0, true);       // Compression: BI_RGB (none)
    view.setUint32(34, pixelArraySize, true); // Image data size
    view.setInt32(38, 2835, true);     // 72 DPI horizontal
    view.setInt32(42, 2835, true);     // 72 DPI vertical
    view.setUint32(46, 0, true);       // Colors in palette
    view.setUint32(50, 0, true);       // Important colors

    const uint8 = new Uint8Array(buffer);
    let offset = 54;
    const padding = rowSize - width * 3;

    // Standard BMP pixel data: bottom row to top row, BGR order
    for (let y = height - 1; y >= 0; y--) {
      const rowStart = y * width * 4;
      for (let x = 0; x < width; x++) {
        const i = rowStart + x * 4;
        uint8[offset++] = data[i + 2]; // Blue
        uint8[offset++] = data[i + 1]; // Green
        uint8[offset++] = data[i];     // Red
      }
      for (let p = 0; p < padding; p++) {
        uint8[offset++] = 0;
      }
    }

    return new Blob([buffer], { type: "image/bmp" });
  }

  /**
   * Check if the current browser supports encoding to a specific MIME type
   */
  static async checkFormatSupport(mimeType) {
    if (mimeType === "image/bmp") return true; // Handled by our built-in encoder
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(Boolean(blob && blob.type === mimeType));
      }, mimeType);
    });
  }

  /**
   * Export canvas to Blob with fallback
   */
  static async canvasToBlob(canvas, mimeType = "image/png", quality = 0.92, fillColor = "#ffffff") {
    if (mimeType === "image/bmp") {
      return this.canvasToBmpBlob(canvas, fillColor);
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback for browsers with mimeType issues
            const dataUrl = canvas.toDataURL("image/png");
            fetch(dataUrl)
              .then((res) => res.blob())
              .then(resolve);
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Compress an image with quality & format options
   */
  static async compress(imageItem, options = {}) {
    const {
      quality = 0.8,
      format = "image/jpeg",
      maxWidth = null,
      maxHeight = null,
      fillColor = "#ffffff"
    } = options;

    let targetWidth = imageItem.width;
    let targetHeight = imageItem.height;

    if (maxWidth && targetWidth > maxWidth) {
      const ratio = maxWidth / targetWidth;
      targetWidth = maxWidth;
      targetHeight = Math.round(targetHeight * ratio);
    }
    if (maxHeight && targetHeight > maxHeight) {
      const ratio = maxHeight / targetHeight;
      targetHeight = maxHeight;
      targetWidth = Math.round(targetWidth * ratio);
    }

    const { canvas, ctx } = this.createCanvas(targetWidth, targetHeight);

    // If exporting to JPEG or non-alpha format, paint background fill
    if (format === "image/jpeg" && fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(imageItem.img, 0, 0, targetWidth, targetHeight);

    const blob = await this.canvasToBlob(canvas, format, quality);
    const reduction = ((imageItem.size - blob.size) / imageItem.size) * 100;

    return {
      blob,
      width: targetWidth,
      height: targetHeight,
      size: blob.size,
      reduction: Math.round(reduction),
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Resize image to specified dimensions or scale factor
   */
  static async resize(imageItem, options = {}) {
    const {
      width = imageItem.width,
      height = imageItem.height,
      maintainAspect = true,
      format = imageItem.type || "image/png",
      quality = 0.92,
      fillColor = "#ffffff"
    } = options;

    let finalW = parseInt(width, 10);
    let finalH = parseInt(height, 10);

    if (maintainAspect) {
      const ratio = imageItem.width / imageItem.height;
      if (!finalH || (finalW && width !== imageItem.width)) {
        finalH = Math.round(finalW / ratio);
      } else if (!finalW || height !== imageItem.height) {
        finalW = Math.round(finalH * ratio);
      }
    }

    finalW = Math.max(1, finalW || 1);
    finalH = Math.max(1, finalH || 1);

    const { canvas, ctx } = this.createCanvas(finalW, finalH);

    if (format === "image/jpeg" && fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, finalW, finalH);
    }

    ctx.drawImage(imageItem.img, 0, 0, finalW, finalH);
    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: finalW,
      height: finalH,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Crop an image given rectangular coordinates
   */
  static async crop(imageItem, cropBox, options = {}) {
    const { format = imageItem.type || "image/png", quality = 0.92, fillColor = "#ffffff" } = options;
    const { x, y, width, height } = cropBox;

    const safeW = Math.max(1, Math.min(width, imageItem.width - x));
    const safeH = Math.max(1, Math.min(height, imageItem.height - y));

    const { canvas, ctx } = this.createCanvas(safeW, safeH);

    if (format === "image/jpeg" && fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, safeW, safeH);
    }

    ctx.drawImage(imageItem.img, x, y, safeW, safeH, 0, 0, safeW, safeH);
    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: safeW,
      height: safeH,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Convert format (PNG, JPEG, WEBP, AVIF, BMP)
   */
  static async convert(imageItem, options = {}) {
    const {
      targetFormat = "image/webp",
      quality = 0.9,
      fillColor = "#ffffff"
    } = options;

    const { canvas, ctx } = this.createCanvas(imageItem.width, imageItem.height);

    if ((targetFormat === "image/jpeg" || targetFormat === "image/bmp") && fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, imageItem.width, imageItem.height);
    }

    ctx.drawImage(imageItem.img, 0, 0);
    const blob = await this.canvasToBlob(canvas, targetFormat, quality, fillColor);

    return {
      blob,
      width: imageItem.width,
      height: imageItem.height,
      size: blob.size,
      format: targetFormat,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Rotate and Flip image
   */
  static async transform(imageItem, options = {}) {
    const {
      angle = 0, // 0, 90, 180, 270
      flipH = false,
      flipV = false,
      format = imageItem.type || "image/png",
      quality = 0.92
    } = options;

    const isRotated90or270 = angle % 180 !== 0;
    const newWidth = isRotated90or270 ? imageItem.height : imageItem.width;
    const newHeight = isRotated90or270 ? imageItem.width : imageItem.height;

    const { canvas, ctx } = this.createCanvas(newWidth, newHeight);

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(imageItem.img, -imageItem.width / 2, -imageItem.height / 2);
    ctx.restore();

    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: newWidth,
      height: newHeight,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Watermark overlay (text or stamp)
   */
  static async watermark(imageItem, options = {}) {
    const {
      text = "PixelPlane",
      position = "bottom-right", // top-left, top-right, center, bottom-left, bottom-right
      opacity = 0.6,
      color = "#ffffff",
      fontSize = 32,
      fontFamily = "sans-serif",
      format = imageItem.type || "image/png",
      quality = 0.92
    } = options;

    const { canvas, ctx } = this.createCanvas(imageItem.width, imageItem.height);
    ctx.drawImage(imageItem.img, 0, 0);

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize;
    const margin = Math.round(fontSize * 0.8);

    let x = margin;
    let y = margin + textH / 2;

    switch (position) {
      case "top-left":
        x = margin;
        y = margin + textH / 2;
        break;
      case "top-right":
        x = imageItem.width - textW - margin;
        y = margin + textH / 2;
        break;
      case "center":
        x = (imageItem.width - textW) / 2;
        y = imageItem.height / 2;
        break;
      case "bottom-left":
        x = margin;
        y = imageItem.height - margin - textH / 2;
        break;
      case "bottom-right":
      default:
        x = imageItem.width - textW - margin;
        y = imageItem.height - margin - textH / 2;
        break;
    }

    // Shadow for readable contrast over light & dark image areas
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(text, x, y);
    ctx.restore();

    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: imageItem.width,
      height: imageItem.height,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Color and Light tone adjustments (Brightness, Contrast, Saturation, Grayscale, Blur)
   */
  static async adjust(imageItem, options = {}) {
    const {
      brightness = 100, // 0 to 200 (100 is normal)
      contrast = 100,   // 0 to 200 (100 is normal)
      saturation = 100, // 0 to 200 (100 is normal)
      grayscale = 0,    // 0 to 100%
      blur = 0,         // 0 to 20px
      sepia = 0,        // 0 to 100%
      format = imageItem.type || "image/png",
      quality = 0.92
    } = options;

    const { canvas, ctx } = this.createCanvas(imageItem.width, imageItem.height);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px)`;
    ctx.drawImage(imageItem.img, 0, 0);

    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: imageItem.width,
      height: imageItem.height,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Strip EXIF and metadata clean (canvas redraw naturally strips metadata)
   */
  static async stripMetadata(imageItem, options = {}) {
    const { format = imageItem.type || "image/jpeg", quality = 0.92 } = options;
    const { canvas, ctx } = this.createCanvas(imageItem.width, imageItem.height);
    ctx.drawImage(imageItem.img, 0, 0);
    const blob = await this.canvasToBlob(canvas, format, quality);

    return {
      blob,
      width: imageItem.width,
      height: imageItem.height,
      size: blob.size,
      format,
      dataUrl: URL.createObjectURL(blob)
    };
  }

  /**
   * Extract dominant color palette from image
   */
  static extractPalette(imageItem, colorCount = 5) {
    const sampleSize = 100;
    const { canvas, ctx } = this.createCanvas(sampleSize, sampleSize);
    ctx.drawImage(imageItem.img, 0, 0, sampleSize, sampleSize);
    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    const buckets = {};
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent
      const key = `${r},${g},${b}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }

    const sorted = Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([rgbStr]) => {
        const [r, g, b] = rgbStr.split(",").map(Number);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        return { hex, rgb: `rgb(${r}, ${g}, ${b})`, r, g, b };
      });

    return sorted;
  }

  /**
   * Trigger download of a Blob with clean naming
   */
  static download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  /**
   * Copy image blob to clipboard
   */
  static async copyToClipboard(blob) {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error("Clipboard API not supported on this browser.");
    }
    // Clipboard item requires image/png
    if (blob.type !== "image/png") {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      const pngBlob = await new Promise((resolve) => {
        img.onload = () => {
          const { canvas, ctx } = this.createCanvas(img.width, img.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b), "image/png");
          URL.revokeObjectURL(url);
        };
        img.src = url;
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
    } else {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    }
  }

  /**
   * Helper to format bytes to KB / MB
   */
  static formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
