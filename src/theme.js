import { t } from "./i18n/index.js";

const COLOR_STORAGE_KEY = "agewasm-color-theme";
const MODE_STORAGE_KEY = "agewasm-mode";
const LEGACY_MODE_KEY = "agewasm-theme";

const DEFAULT_COLOR_THEME = "claude";

export const COLOR_THEMES = [
  "claude",
  "alloy",
  "pulse",
  "grid",
  "spectra",
  "lattice",
  "signal",
];

const LEGACY_COLOR_MAP = {
  slate: "alloy",
  indigo: "spectra",
  ocean: "grid",
  moss: "lattice",
  sand: "signal",
  graphite: "alloy",
  paper: "signal",
  arctic: "grid",
  midnight: "pulse",
  obsidian: "spectra",
  forest: "lattice",
};

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

  return "light";
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
  syncModeToggle();
}

export function toggleMode() {
  setMode(getMode() === "light" ? "dark" : "light");
}

function syncPressedState(selector, isActive) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = isActive(button);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function syncColorThemeControls() {
  const active = getColorTheme();
  syncPressedState(
    "[data-color-theme-option]",
    (button) => button.dataset.colorThemeOption === active,
  );
}

function syncModeToggle() {
  const button = document.getElementById("modeToggle");
  if (!button) return;

  const isLight = getMode() === "light";
  const lightIcon = button.querySelector(".control-icon--light");
  const darkIcon = button.querySelector(".control-icon--dark");

  if (lightIcon) lightIcon.hidden = !isLight;
  if (darkIcon) darkIcon.hidden = isLight;

  const hintKey = isLight ? "settings.switchToDark" : "settings.switchToLight";
  button.setAttribute("aria-label", t(hintKey));
  button.setAttribute("title", t(hintKey));
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

  document.getElementById("modeToggle")?.addEventListener("click", toggleMode);

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

  document.addEventListener("click", (event) => {
    const picker = document.getElementById("themePicker");
    if (picker && !picker.contains(event.target)) {
      closeThemePicker();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeThemePicker();
  });

  document.addEventListener("localechange", syncModeToggle);
}