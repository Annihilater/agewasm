import { Tab } from "bootstrap";

const STORAGE_KEY = "agewasm-ui-state";

const VALID_TABS = new Set([
  "keys-tab",
  "encrypt-tab",
  "encrypt-binary-tab",
  "decrypt-tab",
  "decrypt-binary-tab",
  "about-tab",
]);

const PERSISTED_FIELDS = [
  "privkey",
  "pubkey",
  "recipients",
  "message",
  "encryptedOutput",
  "recipients-binary",
  "identities",
  "encryptedText",
  "decryptedOutput",
  "identities-binary",
];

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveUiState() {
  const fields = {};
  for (const id of PERSISTED_FIELDS) {
    const el = document.getElementById(id);
    if (el && typeof el.value === "string") {
      fields[id] = el.value;
    }
  }

  const activeTab = document.querySelector("#myTab .nav-link.active")?.id;
  writeState({
    activeTab: VALID_TABS.has(activeTab) ? activeTab : "keys-tab",
    fields,
  });
}

function restoreFields(fields = {}) {
  for (const id of PERSISTED_FIELDS) {
    const el = document.getElementById(id);
    if (el && typeof fields[id] === "string") {
      el.value = fields[id];
    }
  }

  const pubshare = document.getElementById("pubkey-share");
  const pubkey = document.getElementById("pubkey");
  if (pubshare && pubkey?.value) {
    pubshare.removeAttribute("hidden");
    pubshare.setAttribute("href", `/?pubkey=${encodeURIComponent(pubkey.value)}`);
  }
}

function activateTab(tabId) {
  const tab = document.getElementById(tabId);
  if (!tab || !VALID_TABS.has(tabId)) return false;

  const tabInstance = Tab.getOrCreateInstance(tab);
  tabInstance.show();
  return true;
}

export function restoreUiState({ preferTab } = {}) {
  const state = readState();
  restoreFields(state.fields);

  const tabToOpen =
    preferTab && VALID_TABS.has(preferTab)
      ? preferTab
      : VALID_TABS.has(state.activeTab)
        ? state.activeTab
        : "keys-tab";

  activateTab(tabToOpen);
}

export function initUiStatePersistence() {
  const tabList = document.getElementById("myTab");
  tabList?.addEventListener("shown.bs.tab", saveUiState);

  for (const id of PERSISTED_FIELDS) {
    const el = document.getElementById(id);
    el?.addEventListener("input", saveUiState);
  }
}