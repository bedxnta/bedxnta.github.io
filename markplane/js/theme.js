(() => {
  const STORAGE_KEY = "markplane-theme";
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  function syncButton(theme) {
    const next = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.setAttribute("aria-label", `Switch to ${next} mode`);
    button.title = `Switch to ${next} mode`;
  }

  syncButton(document.documentElement.dataset.theme || "light");
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    syncButton(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Theme remains usable for this page even when storage is unavailable.
    }
  });
})();
