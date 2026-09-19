import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div>{t("footer.line1")}</div>
        <div>{t("footer.line2")}</div>
        <Link to="/admin" className="footer-admin-link">
          {t("footer.adminLogin")}
        </Link>
      </div>
    </footer>
  );
}
