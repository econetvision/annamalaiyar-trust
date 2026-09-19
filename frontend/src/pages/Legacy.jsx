import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Legacy() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.legacy().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Our Legacy</h2>
        <p className="section-subtitle">{data.trust_name}</p>

        <div className="legacy-banner">
          <img src={data.legacy_image} alt="Annamalaiyar Trust official commemorative artwork" />
        </div>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#7a6a52", marginTop: "0.5rem" }}>
          {data.verification_note}
        </p>

        <div className="legacy-meta">
          <div className="card">
            <div className="card-body">
              <h4>Founded</h4>
              <p>{data.founded}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Location</h4>
              <p>{data.location}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Parent Group</h4>
              <p>{data.parent_group}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Milestone</h4>
              <p>{data.milestone}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-body">
            <h4>Affiliated Entities</h4>
            <ul>
              {data.affiliates.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
