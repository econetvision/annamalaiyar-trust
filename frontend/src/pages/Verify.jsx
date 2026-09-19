import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api.js";
import { setAgentCode } from "../auth.js";

export default function Verify() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await api.status(code.trim().toUpperCase());
      setResult(data);
      setAgentCode(data.agent_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>{t("verify.title")}</h2>
        <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>{t("verify.subtitle")}</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={check}>
          <div className="field">
            <label htmlFor="code">{t("verify.agentCode")}</label>
            <input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("verify.agentCodePlaceholder")}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("verify.checking") : t("verify.check")}
          </button>
        </form>

        {result && (
          <div className="result-box">
            <div style={{ fontWeight: 700 }}>{result.name}</div>
            <div className="agent-code">{result.agent_code}</div>
            <span className={`status-pill ${result.status === "verified" ? "status-verified" : "status-pending"}`}>
              {result.status === "verified" ? t("verify.verified") : t("verify.pending")}
            </span>

            {result.status === "verified" && result.voucher && (
              <div className="voucher-card">
                <div style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>{t("verify.voucherTitle")}</div>
                <div className="voucher-amount">&#8377;{result.voucher.amount}</div>
                <div className="voucher-code">{result.voucher.code}</div>
                <div style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.85 }}>
                  {t("verify.issued")} {new Date(result.voucher.issued_at).toLocaleDateString()}
                </div>
              </div>
            )}

            {result.status === "pending" && (
              <p style={{ fontSize: "0.85rem", marginTop: "0.8rem" }}>{t("verify.pendingNote")}</p>
            )}

            <Link to="/products" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              {t("verify.browseProducts")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
