(function () {
  const THEME_KEY = "theme";              // "dark" | "light"
  const root = document.documentElement;

  function apply(theme) {
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
    }
  }

  function getSaved() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    apply(theme);
  }

  // Public API (used by shortcuts.js)
  window.Theme = {
    toggle() {
      const next = getSaved() === "light" ? "dark" : "light";
      setTheme(next);
      return next;
    },
    current() {
      return getSaved();
    },
    set: setTheme,
  };

  // Boot
  apply(getSaved());
})();
