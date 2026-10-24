// PixelPlane Application Coordinator
import { TOOLS } from "./tools.js";
import { ImageEngine } from "./image-engine.js";

class PixelPlaneApp {
  constructor() {
    this.selectedTool = null;
    this.loadedImages = [];
    this.activeFilter = "all";

    this.cacheDOMElements();
    this.bindEvents();
    this.renderToolGrid();
  }

  cacheDOMElements() {
    this.toolGrid = document.querySelector("#tool-grid");
    this.filterChips = document.querySelectorAll(".filter-chip");
    this.searchInput = document.querySelector("#tool-search");
    this.emptyState = document.querySelector("#empty-state");

    // Dialog elements
    this.dialog = document.querySelector("#tool-dialog");
    this.dialogTitle = document.querySelector("#dialog-title");
    this.dialogDesc = document.querySelector("#dialog-description");
    this.dialogIcon = document.querySelector("#dialog-icon");
    this.dialogBadge = document.querySelector("#dialog-badge");
    this.dropZone = document.querySelector("#drop-zone");
    this.fileInput = document.querySelector("#file-input");
    this.dropHint = document.querySelector("#drop-hint");
    this.fileList = document.querySelector("#file-list");
    this.toolOptions = document.querySelector("#tool-options");
    this.processBtn = document.querySelector("#process-button");
    this.processLabel = document.querySelector("#process-label");
    this.statusMessage = document.querySelector("#status-message");
  }

  bindEvents() {
    // Category filter clicks
    this.filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.filterChips.forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        this.activeFilter = chip.dataset.filter;
        this.filterTools();
      });
    });

    // Search input
    this.searchInput.addEventListener("input", () => this.filterTools());

    // Keyboard shortcut '/' or 'Ctrl+K' to focus search
    window.addEventListener("keydown", (e) => {
      if (
        e.key === "/" &&
        document.activeElement !== this.searchInput &&
        !this.dialog.open
      ) {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      }
    });

    // Dialog close (backdrop click only)
    this.dialog.addEventListener("click", (e) => {
      // Only evaluate if the click target is the dialog itself (the backdrop),
      // preventing clicks on inner elements or synthetic input clicks from closing it
      if (e.target !== this.dialog) return;

      const rect = this.dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        this.closeDialog();
      }
    });

    document.querySelectorAll(".dialog-close").forEach((btn) => {
      btn.addEventListener("click", () => this.closeDialog());
    });

    // Prevent file input click from re-bubbling
    this.fileInput.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Drag and Drop on drop zone
    this.dropZone.addEventListener("click", (e) => {
      if (e.target !== this.fileInput) {
        this.fileInput.click();
      }
    });
    this.dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    ["dragenter", "dragover"].forEach((evt) => {
      this.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      this.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove("drag-over");
      });
    });

    this.dropZone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    this.fileInput.addEventListener("change", () => {
      if (this.fileInput.files && this.fileInput.files.length > 0) {
        this.handleFiles(Array.from(this.fileInput.files));
      }
    });

    // Global Paste (Ctrl+V) support!
    window.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            if (!this.dialog.open) {
              this.openTool("compress");
            }
            this.handleFiles([file]);
            this.setStatus("Image pasted from clipboard!", "success");
            break;
          }
        }
      }
    });

    // Process button click
    this.processBtn.addEventListener("click", () => this.executeTool());

    // In-page navigation scrollspy
    const navLinks = document.querySelectorAll(".main-nav .nav-link");
    const sections = ["tools", "how-it-works", "creator"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length > 0 && navLinks.length > 0) {
      window.addEventListener("scroll", () => {
        const scrollPos = window.scrollY + 140;
        for (let i = sections.length - 1; i >= 0; i--) {
          const sec = sections[i];
          if (sec.offsetTop <= scrollPos) {
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              link.classList.toggle("active", href === `#${sec.id}`);
            });
            break;
          }
        }
      });
    }

    // Bedanta cycling subtitle animation
    const bedantaSub = document.getElementById("bedanta-sub");
    if (bedantaSub) {
      const texts = [
        "Really Good Video Gamer",
        "Electrical Engineering Student",
        "Building Weird Internet Things"
      ];
      let tIdx = 0;
      setInterval(() => {
        tIdx = (tIdx + 1) % texts.length;
        bedantaSub.textContent = texts[tIdx];
        bedantaSub.classList.remove("text-change");
        void bedantaSub.offsetWidth;
        bedantaSub.classList.add("text-change");
      }, 2600);
    }
  }

  renderToolGrid() {
    this.toolGrid.innerHTML = "";
    const allChipSpan = document.querySelector('.filter-chip[data-filter="all"] span');
    if (allChipSpan) {
      allChipSpan.textContent = Object.keys(TOOLS).length;
    }

    Object.values(TOOLS).forEach((tool) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "tool-card";
      card.dataset.tool = tool.id;
      card.dataset.category = tool.category;
      card.dataset.search = `${tool.title.toLowerCase()} ${tool.searchTerms} ${tool.description.toLowerCase()}`;

      card.innerHTML = `
        <span class="tool-icon ${tool.badgeTone}">
          ${tool.svgIcon}
        </span>
        <span class="tool-card-copy">
          <span class="tool-name">${tool.title}</span>
          <span class="tool-description">${tool.description}</span>
        </span>
        <span class="tool-arrow" aria-hidden="true">↗</span>
      `;

      card.addEventListener("click", () => this.openTool(tool.id));
      this.toolGrid.appendChild(card);
    });
  }

  filterTools() {
    const query = this.searchInput.value.trim().toLowerCase();
    const cards = this.toolGrid.querySelectorAll(".tool-card");
    let matchCount = 0;

    cards.forEach((card) => {
      const cat = card.dataset.category;
      const searchData = card.dataset.search;

      const matchesCat = this.activeFilter === "all" || cat === this.activeFilter;
      const matchesSearch = !query || searchData.includes(query);

      if (matchesCat && matchesSearch) {
        card.style.display = "";
        matchCount++;
      } else {
        card.style.display = "none";
      }
    });

    this.emptyState.hidden = matchCount > 0;
  }

  openTool(toolId) {
    const tool = TOOLS[toolId];
    if (!tool) return;

    this.selectedTool = tool;
    this.loadedImages = [];

    this.dialogTitle.textContent = tool.title;
    this.dialogDesc.textContent = tool.description;
    this.dialogBadge.textContent = tool.badgeLabel;
    this.dialogIcon.className = `tool-icon dialog-tool-icon ${tool.badgeTone}`;
    this.dialogIcon.innerHTML = tool.svgIcon;

    this.fileInput.accept = tool.accept;
    this.fileInput.multiple = tool.multiple;
    this.fileInput.value = "";
    this.dropHint.textContent = tool.hint;

    this.fileList.innerHTML = "";
    this.toolOptions.innerHTML = "";
    this.processBtn.disabled = true;
    this.processLabel.textContent = "Drop an image to continue";
    this.setStatus("");

    this.dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  closeDialog() {
    this.dialog.close();
    document.body.style.overflow = "";
    this.selectedTool = null;
    this.loadedImages = [];
  }

  async handleFiles(files) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      this.setStatus("Please choose image files (PNG, JPG, WebP, etc.).", "error");
      return;
    }

    this.setStatus("Reading image data...", "");
    const tool = this.selectedTool;

    try {
      const incoming = tool.multiple ? imageFiles : [imageFiles[0]];
      const loaded = [];

      for (const file of incoming) {
        const item = await ImageEngine.load(file);
        loaded.push(item);
      }

      this.loadedImages = loaded;
      this.renderLoadedFiles();
      this.renderToolOptions();
      this.setStatus("");
    } catch (err) {
      this.setStatus(`Error loading image: ${err.message}`, "error");
    }
  }

  renderLoadedFiles() {
    this.fileList.innerHTML = "";
    this.loadedImages.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "file-row";
      row.dataset.fileIndex = index;

      const orderControls = this.selectedTool.id === "pdf"
        ? `
          <span class="file-row-order">
            <button type="button" class="file-row-drag" aria-label="Drag to reorder page ${index + 1}" title="Drag to reorder">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h1M10 3h1M5 8h1M10 8h1M5 13h1M10 13h1" /></svg>
            </button>
            <button type="button" class="file-row-move" data-move="-1" aria-label="Move page ${index + 1} up" title="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
            <button type="button" class="file-row-move" data-move="1" aria-label="Move page ${index + 1} down" title="Move down" ${index === this.loadedImages.length - 1 ? "disabled" : ""}>↓</button>
          </span>
        `
        : "";
      row.innerHTML = `
        <span class="file-row-thumb"><img src="${item.dataUrl}" alt="" /></span>
        <span class="file-row-info">
          <span class="file-row-name">${item.name}</span>
          <span class="file-row-meta">${item.width} × ${item.height} px · ${ImageEngine.formatBytes(item.size)}</span>
        </span>
        ${orderControls}
        <button type="button" class="file-row-remove" title="Remove" aria-label="Remove image">×</button>
      `;

      row.querySelectorAll(".file-row-move").forEach((button) => {
        button.addEventListener("click", () => {
          const targetIndex = index + Number(button.dataset.move);
          if (targetIndex < 0 || targetIndex >= this.loadedImages.length) return;
          const previousPositions = this.captureFileRowPositions();
          [this.loadedImages[index], this.loadedImages[targetIndex]] = [
            this.loadedImages[targetIndex],
            this.loadedImages[index]
          ];
          this.renderLoadedFiles();
          this.animateFileRowPositions(previousPositions);
        });
      });

      const dragHandle = row.querySelector(".file-row-drag");
      if (dragHandle) {
        let dragging = false;
        const originalItems = this.loadedImages.slice();

        dragHandle.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          dragging = true;
          const rowRect = row.getBoundingClientRect();
          const pointerOffsetX = event.clientX - rowRect.left;
          const pointerOffsetY = event.clientY - rowRect.top;
          const placeholder = document.createElement("div");
          placeholder.className = "file-row-placeholder";
          placeholder.style.height = `${rowRect.height}px`;
          placeholder.dataset.fileIndex = index;
          row.before(placeholder);
          row.classList.add("file-row-dragging");
          row.style.width = `${rowRect.width}px`;
          row.style.left = `${rowRect.left}px`;
          row.style.top = `${rowRect.top}px`;
          row.style.height = `${rowRect.height}px`;
          row.style.position = "fixed";
          row.style.zIndex = "20";
          row.style.pointerEvents = "none";
          row.style.margin = "0";
          row.style.boxSizing = "border-box";
          this.dialog.appendChild(row);
          this.dialog.setPointerCapture(event.pointerId);

          const moveHandler = (moveEvent) => {
            row.style.left = `${moveEvent.clientX - pointerOffsetX}px`;
            row.style.top = `${moveEvent.clientY - pointerOffsetY}px`;

            const remainingRows = Array.from(this.fileList.children).filter(
              (fileRow) => fileRow !== placeholder
            );
            const targetIndex = remainingRows.findIndex((fileRow) => {
              const targetRect = fileRow.getBoundingClientRect();
              return moveEvent.clientY < targetRect.top + targetRect.height / 2;
            });
            const referenceRow = targetIndex < 0 ? null : remainingRows[targetIndex];
            if (
              (referenceRow && placeholder.nextElementSibling === referenceRow) ||
              (!referenceRow && placeholder === this.fileList.lastElementChild)
            ) {
              return;
            }

            const previousPositions = this.captureFileRowPositions(originalItems);
            this.fileList.insertBefore(placeholder, referenceRow);
            this.animateFileRowPositions(previousPositions, originalItems);
          };

          const finishDragging = (finishEvent) => {
            if (!dragging) return;
            dragging = false;
            this.dialog.removeEventListener("pointermove", moveHandler);
            this.dialog.removeEventListener("pointerup", finishDragging);
            this.dialog.removeEventListener("pointercancel", finishDragging);
            if (this.dialog.hasPointerCapture(finishEvent.pointerId)) {
              this.dialog.releasePointerCapture(finishEvent.pointerId);
            }

            const previousPositions = this.captureFileRowPositions(originalItems);
            row.classList.remove("file-row-dragging");
            row.removeAttribute("style");
            placeholder.replaceWith(row);
            this.loadedImages = Array.from(this.fileList.children, (fileRow) =>
              originalItems[Number(fileRow.dataset.fileIndex)]
            );
            this.renderLoadedFiles();
            this.animateFileRowPositions(previousPositions);
          };

          this.dialog.addEventListener("pointermove", moveHandler);
          this.dialog.addEventListener("pointerup", finishDragging);
          this.dialog.addEventListener("pointercancel", finishDragging);
        });
      }

      row.querySelector(".file-row-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        this.loadedImages.splice(index, 1);
        this.renderLoadedFiles();
        if (this.loadedImages.length > 0) {
          this.renderToolOptions();
        } else {
          this.toolOptions.innerHTML = "";
          this.processBtn.disabled = true;
          this.processLabel.textContent = "Drop an image to continue";
        }
      });

      this.fileList.appendChild(row);
    });

    const hasImages = this.loadedImages.length > 0;
    this.processBtn.disabled = !hasImages;
    if (hasImages) {
      this.processLabel.textContent = this.selectedTool.actionLabel || "Process Image";
    }
  }

  captureFileRowPositions(items = this.loadedImages) {
    const rows = Array.from(this.fileList.children);
    const positions = new Map(
      rows.map((row) => [
        items[Number(row.dataset.fileIndex)],
        row.getBoundingClientRect().top
      ])
    );
    rows.forEach((row) => row.getAnimations().forEach((animation) => animation.cancel()));
    return positions;
  }

  animateFileRowPositions(previousPositions, items = this.loadedImages) {
    this.fileList.querySelectorAll(".file-row").forEach((row) => {
      const previousTop = previousPositions.get(items[Number(row.dataset.fileIndex)]);
      if (previousTop === undefined) return;
      const offsetY = previousTop - row.getBoundingClientRect().top;
      if (offsetY === 0) return;

      row.animate(
        [{ transform: `translateY(${offsetY}px)` }, { transform: "translateY(0)" }],
        { duration: 220, easing: "ease-out" }
      );
    });
  }

  async renderToolOptions() {
    if (!this.selectedTool || this.loadedImages.length === 0) return;
    this.toolOptions.innerHTML = "";
    await this.selectedTool.renderControls(this.toolOptions, this.loadedImages);
  }

  async executeTool() {
    if (!this.selectedTool || this.loadedImages.length === 0) return;

    this.processBtn.disabled = true;
    const origLabel = this.processLabel.textContent;
    this.processLabel.textContent = "Processing locally...";
    this.setStatus("Processing your image...", "info");

    try {
      const results = await this.selectedTool.process(this.loadedImages, this.toolOptions, (msg) => {
        this.setStatus(msg, "info");
      });

      this.setStatus("Done! File ready and downloaded.", "success");
      this.processLabel.textContent = "Success ✓";

      setTimeout(() => {
        this.processBtn.disabled = false;
        this.processLabel.textContent = origLabel;
      }, 2000);
    } catch (err) {
      console.error(err);
      this.setStatus(`Processing failed: ${err.message}`, "error");
      this.processBtn.disabled = false;
      this.processLabel.textContent = origLabel;
    }
  }

  setStatus(message = "", type = "") {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message${type ? ` ${type}` : ""}`;
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.pixelPlane = new PixelPlaneApp();
});
