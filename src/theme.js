const STORAGE_KEY = "agewasm-theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getTheme() {
  return document.documentElement.dataset.bsTheme ?? "light";
}

export function detectTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return getSystemTheme();
}

export function setTheme(theme, { persist = true } = {}) {
  if (theme !== "light" && theme !== "dark") return;
  document.documentElement.dataset.bsTheme = theme;
  if (persist) localStorage.setItem(STORAGE_KEY, theme);
  syncThemeControls();
}

function syncThemeControls() {
  const theme = getTheme();
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const active = button.dataset.themeOption === theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

export function initTheme() {
  setTheme(detectTheme(), { persist: false });

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeOption);
    });
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? "dark" : "light", { persist: false });
      }
    });
}