const STORAGE_KEY = "agewasm-color-theme";
const LEGACY_STORAGE_KEY = "agewasm-theme";
const DEFAULT_THEME = "slate";

export const COLOR_THEMES = [
  "slate",
  "paper",
  "arctic",
  "midnight",
  "obsidian",
  "forest",
];

const THEME_MODES = {
  slate: "light",
  paper: "light",
  arctic: "light",
  midnight: "dark",
  obsidian: "dark",
  forest: "dark",
};

export function getColorTheme() {
  return document.documentElement.dataset.colorTheme ?? DEFAULT_THEME;
}

export function detectColorTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (COLOR_THEMES.includes(saved)) return saved;

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === "dark") return "midnight";
  if (legacy === "light") return "slate";

  return DEFAULT_THEME;
}

export function setColorTheme(theme, { persist = true } = {}) {
  if (!COLOR_THEMES.includes(theme)) return;

  document.documentElement.dataset.colorTheme = theme;
  document.documentElement.dataset.bsTheme = THEME_MODES[theme];

  if (persist) {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  syncColorThemeControls();
}

function syncColorThemeControls() {
  const active = getColorTheme();

  document.querySelectorAll("[data-color-theme-option]").forEach((button) => {
    const selected = button.dataset.colorThemeOption === active;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
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

  const trigger = document.getElementById("themePickerTrigger");
  trigger?.addEventListener("click", (event) => {
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

}