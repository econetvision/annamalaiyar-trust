import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const links = [
  { to: "/", key: "nav.home", end: true },
  { to: "/register", key: "nav.register" },
  { to: "/verify", key: "nav.verify" },
  { to: "/legacy", key: "nav.legacy" },
  { to: "/products", key: "nav.products" },
  { to: "/expo", key: "nav.expo" },
  { to: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge">
            <img src="/assets/main-logo.png" alt="Sri Muruga Vilas Group - Annamalaiyar Trust" />
          </span>
          <span>
            {t("nav.brandName")}
            <span className="brand-sub">{t("nav.brandSub")}</span>
          </span>
        </div>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className={`navbar-lang ${menuOpen ? "open" : ""}`}>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
