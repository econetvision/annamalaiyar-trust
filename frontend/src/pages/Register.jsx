import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api.js";
import { setAgentCode } from "../auth.js";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  town: "",
  registration_type: "agent",
  vendor_type: "",
  payment_method: "none",
  account_holder_name: "",
  bank_name: "",
  ifsc_code: "",
  account_number: "",
  upi_id: "",
};

const VENDOR_TYPES = [
  { value: "manufacturer", key: "register.vendorManufacturer" },
  { value: "supplier_trader", key: "register.vendorSupplierTrader" },
  { value: "retailer", key: "register.vendorRetailer" },
  { value: "seller", key: "register.vendorSeller" },
];

export default function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriber, setSubscriber] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setField = (field, value) => setForm({ ...form, [field]: value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        town: form.town,
        registration_type: form.registration_type,
        vendor_type: form.registration_type === "vendor" ? form.vendor_type : "",
        account_holder_name: form.payment_method === "bank" ? form.account_holder_name : "",
        bank_name: form.payment_method === "bank" ? form.bank_name : "",
        ifsc_code: form.payment_method === "bank" ? form.ifsc_code : "",
        account_number: form.payment_method === "bank" ? form.account_number : "",
        upi_id: form.payment_method === "upi" ? form.upi_id : "",
      };
      const result = await api.register(payload);
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
          <div className="form-section-label">{t("register.chooseType")}</div>
          <div className="type-grid">
            {[
              { value: "agent", key: "register.typeAgent" },
              { value: "vendor", key: "register.typeVendor" },
              { value: "consumer", key: "register.typeConsumer" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`type-card ${form.registration_type === opt.value ? "selected" : ""}`}
                onClick={() => setField("registration_type", opt.value)}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>

          {form.registration_type === "vendor" && (
            <>
              <div className="form-section-label">{t("register.vendorTypeLabel")}</div>
              <div className="pill-group">
                {VENDOR_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`pill-option ${form.vendor_type === opt.value ? "selected" : ""}`}
                    onClick={() => setField("vendor_type", opt.value)}
                  >
                    {t(opt.key)}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="form-section-label">{t("register.yourDetails")}</div>
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

          <div className="form-section-label">{t("register.paymentDetails")}</div>
          <div style={{ fontSize: "0.82rem", color: "#7a6a52", marginTop: "-0.3rem", marginBottom: "0.5rem" }}>
            {t("register.paymentMethodLabel")}
          </div>
          <div className="pill-group">
            {[
              { value: "none", key: "register.paymentNone" },
              { value: "bank", key: "register.paymentBank" },
              { value: "upi", key: "register.paymentUpi" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`pill-option ${form.payment_method === opt.value ? "selected" : ""}`}
                onClick={() => setField("payment_method", opt.value)}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>

          {form.payment_method === "bank" && (
            <>
              <div className="field">
                <label htmlFor="account_holder_name">{t("register.accountHolderName")}</label>
                <input
                  id="account_holder_name"
                  required
                  value={form.account_holder_name}
                  onChange={update("account_holder_name")}
                />
              </div>
              <div className="field">
                <label htmlFor="bank_name">{t("register.bankName")}</label>
                <input id="bank_name" required value={form.bank_name} onChange={update("bank_name")} />
              </div>
              <div className="field">
                <label htmlFor="ifsc_code">{t("register.ifscCode")}</label>
                <input
                  id="ifsc_code"
                  required
                  value={form.ifsc_code}
                  onChange={(e) => setField("ifsc_code", e.target.value.toUpperCase())}
                  style={{ textTransform: "uppercase" }}
                  maxLength={11}
                />
              </div>
              <div className="field">
                <label htmlFor="account_number">{t("register.accountNumber")}</label>
                <input
                  id="account_number"
                  required
                  inputMode="numeric"
                  value={form.account_number}
                  onChange={update("account_number")}
                />
              </div>
            </>
          )}

          {form.payment_method === "upi" && (
            <div className="field">
              <label htmlFor="upi_id">{t("register.upiId")}</label>
              <input
                id="upi_id"
                required
                value={form.upi_id}
                onChange={update("upi_id")}
                placeholder={t("register.upiPlaceholder")}
              />
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("register.submitting") : t("register.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
