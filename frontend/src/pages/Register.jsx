import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { setAgentCode } from "../auth.js";

const initialForm = { name: "", phone: "", email: "", address: "", town: "" };

export default function Register() {
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
          <h2>Registration Successful</h2>
          <p>Welcome, {subscriber.name}. Your unique agent code has been generated below.</p>
          <div className="result-box">
            <div>Your Agent Code</div>
            <div className="agent-code">{subscriber.agent_code}</div>
            <span className="status-pill status-pending">PENDING VERIFICATION</span>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Please note down this code. Share it with the Annamalaiyar Trust office to get it verified. Once
            verified, a &#8377;250 gift voucher will be issued to you automatically. You can check your status
            anytime on the{" "}
            <Link to={`/verify?code=${subscriber.agent_code}`} style={{ color: "#6b0f1a", fontWeight: 600 }}>
              Verify Agent Code
            </Link>{" "}
            page.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Browse Product Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Subscriber Registration</h2>
        <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>
          Register with Annamalaiyar Trust to receive your agent code and become an authorized member.
        </p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full Name *</label>
            <input id="name" required value={form.name} onChange={update("name")} placeholder="e.g. Muthu Kumar" />
          </div>
          <div className="field">
            <label htmlFor="phone">Mobile Number *</label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={update("phone")}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} placeholder="optional" />
          </div>
          <div className="field">
            <label htmlFor="town">Town / Village</label>
            <input id="town" value={form.town} onChange={update("town")} placeholder="e.g. Chinna Salem" />
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <textarea id="address" rows={3} value={form.address} onChange={update("address")} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Registering..." : "Register & Generate Agent Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
