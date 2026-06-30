const COLOR_STORAGE_KEY = "agewasm-color-theme";
const MODE_STORAGE_KEY = "agewasm-mode";
const LEGACY_MODE_KEY = "agewasm-theme";

const DEFAULT_COLOR_THEME = "slate";

export const COLOR_THEMES = [
  "slate",
  "indigo",
  "ocean",
  "moss",
  "sand",
  "graphite",
];

const LEGACY_COLOR_MAP = {
  paper: "sand",
  arctic: "ocean",
  midnight: "ocean",
  obsidian: "indigo",
  forest: "moss",
};

function getSystemMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getColorTheme() {
  return document.documentElement.dataset.colorTheme ?? DEFAULT_COLOR_THEME;
}

export function getMode() {
  return document.documentElement.dataset.bsTheme ?? "light";
}

export function detectColorTheme() {
  const saved = localStorage.getItem(COLOR_STORAGE_KEY);
  if (COLOR_THEMES.includes(saved)) return saved;
  if (saved && LEGACY_COLOR_MAP[saved]) return LEGACY_COLOR_MAP[saved];
  return DEFAULT_COLOR_THEME;
}

export function detectMode() {
  const saved = localStorage.getItem(MODE_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  const legacy = localStorage.getItem(LEGACY_MODE_KEY);
  if (legacy === "light" || legacy === "dark") return legacy;

  return getSystemMode();
}

export function setColorTheme(theme, { persist = true } = {}) {
  if (!COLOR_THEMES.includes(theme)) return;

  document.documentElement.dataset.colorTheme = theme;
  if (persist) localStorage.setItem(COLOR_STORAGE_KEY, theme);
  syncColorThemeControls();
}

export function setMode(mode, { persist = true } = {}) {
  if (mode !== "light" && mode !== "dark") return;

  document.documentElement.dataset.bsTheme = mode;
  if (persist) {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    localStorage.removeItem(LEGACY_MODE_KEY);
  }
  syncModeControls();
}

function syncColorThemeControls() {
  const active = getColorTheme();

  document.querySelectorAll("[data-color-theme-option]").forEach((button) => {
    const selected = button.dataset.colorThemeOption === active;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function syncModeControls() {
  const mode = getMode();

  document.querySelectorAll("[data-mode-option]").forEach((button) => {
    const active = button.dataset.modeOption === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function closeThemePicker() {
  const menu = document.getElementById("themePickerMenu");
  const trigger = document.getElementById("themePickerTrigger");
  if (!menu || !trigger) return;

  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
}

function openThemePicker() {
  const menu = document.getElementById("themePickerMenu");
  const trigger = document.getElementById("themePickerTrigger");
  if (!menu || !trigger) return;

  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
}

function toggleThemePicker() {
  const menu = document.getElementById("themePickerMenu");
  if (!menu) return;

  if (menu.hidden) openThemePicker();
  else closeThemePicker();
}

export function initTheme() {
  setColorTheme(detectColorTheme(), { persist: false });
  setMode(detectMode(), { persist: false });

  document.getElementById("themePickerTrigger")?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleThemePicker();
  });

  document.querySelectorAll("[data-color-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setColorTheme(button.dataset.colorThemeOption);
      closeThemePicker();
    });
  });

  document.querySelectorAll("[data-mode-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.modeOption);
    });
  });

  document.addEventListener("click", (event) => {
    const picker = document.getElementById("themePicker");
    if (picker && !picker.contains(event.target)) {
      closeThemePicker();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeThemePicker();
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      if (!localStorage.getItem(MODE_STORAGE_KEY)) {
        setMode(event.matches ? "dark" : "light", { persist: false });
      }
    });
}