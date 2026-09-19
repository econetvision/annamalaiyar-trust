import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ta from "./locales/ta.json";
import en from "./locales/en.json";

const STORAGE_KEY = "atc_lang";

function getStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable - language just won't persist across visits.
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ta: { translation: ta },
    en: { translation: en },
  },
  lng: getStoredLanguage() || "ta",
  fallbackLng: "ta",
  interpolation: { escapeValue: false },
});

export default i18n;
