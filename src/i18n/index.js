import en from "./en.json";
import zh from "./zh.json";

const LOCALES = { en, zh };
const STORAGE_KEY = "agewasm-locale";
const DEFAULT_LOCALE = "en";

let currentLocale = DEFAULT_LOCALE;

function resolve(obj, key) {
  return key.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function t(key) {
  const value = resolve(LOCALES[currentLocale], key);
  if (value !== undefined) return value;
  return resolve(LOCALES[DEFAULT_LOCALE], key) ?? key;
}

export function getLocale() {
  return currentLocale;
}

function readLocaleFromUrl() {
  const lang = new URLSearchParams(window.location.search).get("lang");
  return lang === "zh" || lang === "en" ? lang : null;
}

export function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  const fromUrl = readLocaleFromUrl();
  if (fromUrl) return fromUrl;
  return DEFAULT_LOCALE;
}

function updateDocumentMeta() {
  document.documentElement.lang = currentLocale;
  document.title = t("meta.title");

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", t("meta.description"));
  }

  const titleMeta = document.querySelector("meta[title]");
  if (titleMeta) {
    titleMeta.setAttribute("title", t("meta.title"));
  }
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });

  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });

  updateDocumentMeta();
  syncLocaleToggle();
  document.dispatchEvent(
    new CustomEvent("localechange", { detail: { locale: currentLocale } }),
  );
}

export function setLocale(locale, { persist = true } = {}) {
  if (!LOCALES[locale]) return;
  currentLocale = locale;
  if (persist) localStorage.setItem(STORAGE_KEY, locale);
  applyTranslations();
}

function syncLocaleToggle() {
  const button = document.getElementById("localeToggle");
  const label = button?.querySelector(".locale-toggle-label");
  if (!button || !label) return;

  label.textContent = currentLocale === "zh" ? "中" : "EN";

  const hintKey =
    currentLocale === "zh" ? "settings.switchToEnglish" : "settings.switchToChinese";
  button.setAttribute("aria-label", t(hintKey));
  button.setAttribute("title", t(hintKey));
}

export function toggleLocale() {
  setLocale(currentLocale === "zh" ? "en" : "zh");
}

export function initI18n() {
  currentLocale = detectLocale();
  applyTranslations();

  document.getElementById("localeToggle")?.addEventListener("click", toggleLocale);
}