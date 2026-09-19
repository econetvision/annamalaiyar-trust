import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import AdSpace from "../components/AdSpace.jsx";

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.services().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge-strip">Since 1923 &middot; Annamalaiyar Trust est. 2012</span>
          <h1>அண்ணாமலையார் டிரஸ்ட்</h1>
          <p>
            Serving Chinna Salem and Kallakurichi District with trusted community services, agent-led
            membership, and family-run enterprises under the Sri Muruga Vilas Group.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              Become an Agent
            </Link>
            <Link to="/verify" className="btn btn-outline">
              Verify Agent Code
            </Link>
          </div>
        </div>
      </section>

      <AdSpace />

      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Everything the trust and its affiliate businesses offer, in one place</p>
          <div className="services-grid">
            {services.map((s) => (
              <div className="service-card" key={s.id}>
                <span className="service-icon">{s.icon}</span>
                <span className="service-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore</h2>
          <div className="services-grid">
            <Link to="/legacy" className="service-card">
              <span className="service-icon">🏛️</span>
              <span className="service-name">Our Legacy</span>
            </Link>
            <Link to="/products" className="service-card">
              <span className="service-icon">🛍️</span>
              <span className="service-name">Product Catalogue</span>
            </Link>
            <Link to="/expo" className="service-card">
              <span className="service-icon">🎪</span>
              <span className="service-name">Annamalaiyar Expo</span>
            </Link>
            <Link to="/register" className="service-card">
              <span className="service-icon">📝</span>
              <span className="service-name">Agent Registration</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
