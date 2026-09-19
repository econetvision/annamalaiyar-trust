import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api.js";
import { setAgentCode } from "../auth.js";

const initialForm = { name: "", phone: "", email: "", address: "", town: "" };

export default function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriber, setSubscriber] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.register(form);
      setSubscriber(result);
      setAgentCode(result.agent_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (subscriber) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>{t("register.successTitle")}</h2>
          <p>{t("register.welcome", { name: subscriber.name })}</p>
          <div className="result-box">
            <div>{t("register.yourAgentCode")}</div>
            <div className="agent-code">{subscriber.agent_code}</div>
            <span className="status-pill status-pending">{t("register.pending")}</span>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            {t("register.noteBefore")}{" "}
            <Link to={`/verify?code=${subscriber.agent_code}`} style={{ color: "#6b0f1a", fontWeight: 600 }}>
              {t("register.noteLink")}
            </Link>{" "}
            {t("register.noteAfter")}
          </p>
          <Link to="/products" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            {t("register.browseProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>{t("register.title")}</h2>
        <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>{t("register.subtitle")}</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">{t("register.fullName")}</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={update("name")}
              placeholder={t("register.fullNamePlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">{t("register.mobile")}</label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={update("phone")}
              placeholder={t("register.mobilePlaceholder")}
              maxLength={10}
            />
          </div>
          <div className="field">
            <label htmlFor="email">{t("register.email")}</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder={t("register.emailPlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="town">{t("register.town")}</label>
            <input id="town" value={form.town} onChange={update("town")} placeholder={t("register.townPlaceholder")} />
          </div>
          <div className="field">
            <label htmlFor="address">{t("register.address")}</label>
            <textarea id="address" rows={3} value={form.address} onChange={update("address")} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("register.submitting") : t("register.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
