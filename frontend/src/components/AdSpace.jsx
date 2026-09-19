import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, resolveImageUrl } from "../api.js";

const AUTO_ADVANCE_MS = 5000;

export default function AdSpace() {
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    api.advertisements().then(setAds).catch(() => setAds([]));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [ads.length]);

  const goTo = (i) => {
    clearInterval(timerRef.current);
    setIndex((i + ads.length) % ads.length);
  };

  if (ads.length === 0) return null;

  return (
    <section className="section ad-section">
      <div className="container">
        <h2 className="section-title">{t("ads.title")}</h2>
        <p className="section-subtitle">{t("ads.subtitle")}</p>

        <div className="carousel">
          <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {ads.map((ad) => (
              <Link key={ad.id} to={ad.link || "#"} className="carousel-slide">
                <span className="ad-tag">{t("ads.tag")}</span>
                <img src={resolveImageUrl(ad.image_url)} alt={ad.title} />
              </Link>
            ))}
          </div>

          {ads.length > 1 && (
            <>
              <button
                className="carousel-arrow carousel-arrow-prev"
                onClick={() => goTo(index - 1)}
                aria-label="Previous advertisement"
              >
                &#8249;
              </button>
              <button
                className="carousel-arrow carousel-arrow-next"
                onClick={() => goTo(index + 1)}
                aria-label="Next advertisement"
              >
                &#8250;
              </button>
              <div className="carousel-dots">
                {ads.map((ad, i) => (
                  <button
                    key={ad.id}
                    className={`carousel-dot ${i === index ? "active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to advertisement ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
