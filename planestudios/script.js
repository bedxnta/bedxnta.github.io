(() => {
  const storageKey = "planestudio-theme";
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    metaThemeColor.content = isDark ? "#090d16" : "#f8fafc";

    toggleButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
      button.title = `Switch to ${isDark ? "light" : "dark"} mode`;
      button.querySelector(".theme-icon").innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  };

  const savedTheme = getStoredTheme();
  applyTheme(savedTheme || (mediaQuery.matches ? "dark" : "light"));

  mediaQuery.addEventListener("change", (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Theme switching still works when browser storage is unavailable.
      }
    });
  });

  const heroWord = document.getElementById("hero-word");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (heroWord && !reducedMotion.matches) {
    const words = ["click.", "fly.", "work."];
    let wordIndex = 0;

    window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      heroWord.classList.add("is-changing");
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        heroWord.textContent = words[wordIndex];
        heroWord.classList.remove("is-changing");
      }, 220);
    }, 1500);
  }
})();
