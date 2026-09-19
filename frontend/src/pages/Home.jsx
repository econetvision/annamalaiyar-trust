import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api.js";
import AdSpace from "../components/AdSpace.jsx";

export default function Home() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.services().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge-strip">{t("home.badge")}</span>
          <h1>{t("home.title")}</h1>
          <p>{t("home.subtitle")}</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              {t("home.becomeAgent")}
            </Link>
            <Link to="/verify" className="btn btn-outline">
              {t("home.verifyCode")}
            </Link>
          </div>
        </div>
      </section>

      <AdSpace />

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t("home.servicesTitle")}</h2>
          <p className="section-subtitle">{t("home.servicesSubtitle")}</p>
          <div className="services-grid">
            {services.map((s) => (
              <div className="service-card" key={s.id}>
                <span className="service-icon">{s.icon}</span>
                <span className="service-name">{t(`services.${s.name}`, s.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t("home.exploreTitle")}</h2>
          <div className="services-grid">
            <Link to="/legacy" className="service-card">
              <span className="service-icon">🏛️</span>
              <span className="service-name">{t("home.exploreLegacy")}</span>
            </Link>
            <Link to="/products" className="service-card">
              <span className="service-icon">🛍️</span>
              <span className="service-name">{t("home.exploreProducts")}</span>
            </Link>
            <Link to="/expo" className="service-card">
              <span className="service-icon">🎪</span>
              <span className="service-name">{t("home.exploreExpo")}</span>
            </Link>
            <Link to="/register" className="service-card">
              <span className="service-icon">📝</span>
              <span className="service-name">{t("home.exploreRegister")}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
