import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Expo() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.expo().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Annamalaiyar Expo</h2>
        <p className="section-subtitle">{data.title}</p>

        <div className="expo-hero">
          <img src={data.banner_image} alt="Annamalaiyar Business Trade Fair Expo" />
        </div>

        <div className="expo-stats">
          <div className="stat-card">
            <div className="stat-value">&#8377;{data.ticket_price}</div>
            <div className="stat-label">Ticket Price</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">&#8377;{data.claim_value}</div>
            <div className="stat-label">Claim Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">&#8377;{data.welcome_gift_voucher}</div>
            <div className="stat-label">Welcome Gift Voucher</div>
            {data.welcome_gift_voucher_note && (
              <div className="stat-note">{data.welcome_gift_voucher_note}</div>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-value">&#8377;{data.total_value}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.duration_days} Days</div>
            <div className="stat-label">Expo Duration</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-body">
            <h4 style={{ color: "#6b0f1a", marginTop: 0 }}>About</h4>
            <p>{data.description}</p>
            <h4 style={{ color: "#6b0f1a" }}>Lucky Draw Prizes</h4>
            <ul>
              {data.prizes.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p style={{ fontSize: "0.85rem", color: "#7a6a52" }}>Organized by {data.organizer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
