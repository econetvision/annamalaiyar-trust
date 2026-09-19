import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, resolveImageUrl } from "../api.js";
import { getAgentCode } from "../auth.js";

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [agentCode] = useState(getAgentCode());

  useEffect(() => {
    if (!agentCode) return;
    api.products().then(setProducts).catch(() => setProducts([]));
  }, [agentCode]);

  if (!agentCode) {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center" }}>
          <h2>{t("products.gateTitle")}</h2>
          <p style={{ color: "#7a6a52" }}>{t("products.gateMessage")}</p>
          <Link to="/register" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            {t("products.registerNow")}
          </Link>
          <p style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
            {t("products.haveCode")}{" "}
            <Link to="/verify" style={{ color: "#6b0f1a", fontWeight: 600 }}>
              {t("products.verifyHere")}
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{t("products.title")}</h2>
        <p className="section-subtitle">{t("products.subtitle")}</p>

        {products.length === 0 && (
          <p style={{ textAlign: "center", color: "#7a6a52" }}>{t("products.empty")}</p>
        )}

        <div className="product-grid">
          {products.map((p) => (
            <div className="card product-card" key={p.id}>
              <div className="product-photo-frame">
                {p.image_url ? (
                  <img src={resolveImageUrl(p.image_url)} alt={p.name} className="product-photo" />
                ) : (
                  <span className="product-photo-placeholder">{t("products.noImage")}</span>
                )}
              </div>
              <div className="card-body">
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {p.weight && (
                  <div style={{ fontSize: "0.8rem", color: "#7a6a52", margin: "0.2rem 0" }}>{p.weight}</div>
                )}
                <div className="product-price">&#8377;{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
