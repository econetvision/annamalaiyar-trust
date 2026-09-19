import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/register", label: "Register" },
  { to: "/verify", label: "Verify Agent Code" },
  { to: "/legacy", label: "Our Legacy" },
  { to: "/products", label: "Product Catalogue" },
  { to: "/expo", label: "Annamalaiyar Expo" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge">
            <img src="/assets/main-logo.png" alt="Sri Muruga Vilas Group - Annamalaiyar Trust" />
          </span>
          <span>
            Annamalaiyar Trust
            <span className="brand-sub">Chinna Salem &middot; Since 2012</span>
          </span>
        </div>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
