// Theme Management for PixelPlane
(function () {
  const STORAGE_KEY = "pixelplane-theme";
  const OLD_STORAGE_KEY = "pixelcraft-theme";
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme, animate = false) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = isDark ? "#090d16" : "#f8fafc";
    }

    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
      btn.title = `Switch to ${isDark ? "light" : "dark"} mode`;
      const icon = btn.querySelector(".theme-icon");
      if (icon) {
        icon.innerHTML = isDark
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
      if (animate) {
        btn.classList.remove("theme-switching");
        void btn.offsetWidth;
        btn.classList.add("theme-switching");
        setTimeout(() => btn.classList.remove("theme-switching"), 350);
      }
    });
  }

  // Initial immediate application
  const saved = getStoredTheme();
  applyTheme(saved || (mediaQuery.matches ? "dark" : "light"));

  // System listener
  mediaQuery.addEventListener("change", (e) => {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  // Attach button click handler after DOM load
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(document.documentElement.dataset.theme || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next, true);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {}
      });
    });
  });
})();
