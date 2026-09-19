import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Contact() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.contact().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <p className="section-subtitle">{data.company}</p>

        <div className="legacy-banner">
          <img src={data.card_image} alt={`${data.company} contact card`} />
        </div>

        <div className="legacy-meta">
          <div className="card">
            <div className="card-body">
              <h4>Contact Person</h4>
              <p>
                {data.contact_person}
                <br />
                <span style={{ color: "#7a6a52", fontSize: "0.85rem" }}>{data.designation}</span>
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Phone</h4>
              <p>
                {data.phones.map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s+/g, "")}`} style={{ display: "block", color: "#6b0f1a" }}>
                    {phone}
                  </a>
                ))}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${data.email}`} style={{ color: "#6b0f1a", wordBreak: "break-word" }}>
                  {data.email}
                </a>
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4>Address</h4>
              <p>{data.address}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
