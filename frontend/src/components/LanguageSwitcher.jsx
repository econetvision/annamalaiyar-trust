import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n.js";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switch" role="group" aria-label={i18n.t("lang.switchLabel")}>
      <button
        type="button"
        className={i18n.language === "ta" ? "active" : ""}
        onClick={() => setLanguage("ta")}
      >
        தமிழ்
      </button>
      <button
        type="button"
        className={i18n.language === "en" ? "active" : ""}
        onClick={() => setLanguage("en")}
      >
        English
      </button>
    </div>
  );
}
