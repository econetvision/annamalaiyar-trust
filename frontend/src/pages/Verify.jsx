import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { setAgentCode } from "../auth.js";

export default function Verify() {
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
        <h2>Verify Agent Code</h2>
        <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>
          Enter your agent code to check verification status. Once the trust office verifies your code, your
          &#8377;250 gift voucher will appear here automatically.
        </p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={check}>
          <div className="field">
            <label htmlFor="code">Agent Code</label>
            <input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AT2026-12345"
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {result && (
          <div className="result-box">
            <div style={{ fontWeight: 700 }}>{result.name}</div>
            <div className="agent-code">{result.agent_code}</div>
            <span className={`status-pill ${result.status === "verified" ? "status-verified" : "status-pending"}`}>
              {result.status === "verified" ? "VERIFIED" : "PENDING VERIFICATION"}
            </span>

            {result.status === "verified" && result.voucher && (
              <div className="voucher-card">
                <div style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>ANNAMALAIYAR TRUST GIFT VOUCHER</div>
                <div className="voucher-amount">&#8377;{result.voucher.amount}</div>
                <div className="voucher-code">{result.voucher.code}</div>
                <div style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.85 }}>
                  Issued {new Date(result.voucher.issued_at).toLocaleDateString()}
                </div>
              </div>
            )}

            {result.status === "pending" && (
              <p style={{ fontSize: "0.85rem", marginTop: "0.8rem" }}>
                Your code has not been verified yet. Please visit or contact the Annamalaiyar Trust office at
                Chinna Salem for verification.
              </p>
            )}

            <Link to="/products" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Browse Product Catalogue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
