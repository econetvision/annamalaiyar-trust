import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api, resolveImageUrl } from "../api.js";

const initialProductForm = { name: "", category: "", weight: "", price: "", description: "" };
const initialAdForm = { title: "", link: "" };

const SUBSCRIBERS_PER_PAGE = 50;

export default function Admin() {
  const { t } = useTranslation();
  const [adminKey, setAdminKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberTotalPages, setSubscriberTotalPages] = useState(1);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState(initialProductForm);
  const [productImage, setProductImage] = useState(null);
  const [productError, setProductError] = useState("");
  const [productSaving, setProductSaving] = useState(false);

  const [adForm, setAdForm] = useState(initialAdForm);
  const [adImage, setAdImage] = useState(null);
  const [adError, setAdError] = useState("");
  const [adSaving, setAdSaving] = useState(false);

  const loadSubscribers = async (key, page = subscriberPage, searchTerm = search) => {
    const data = await api.adminSubscribers(key, { page, perPage: SUBSCRIBERS_PER_PAGE, search: searchTerm });
    setSubscribers(data.items);
    setSubscriberPage(data.page);
    setSubscriberTotalPages(data.total_pages);
    setSubscriberTotal(data.total);
  };

  const loadCatalogue = async () => {
    const [prods, adverts] = await Promise.all([api.products(), api.advertisements()]);
    setProducts(prods);
    setAds(adverts);
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await Promise.all([loadSubscribers(adminKey, 1, ""), loadCatalogue()]);
      setUnlocked(true);
    } catch (err) {
      setError(err.message);
      setUnlocked(false);
    }
  };

  const runSearch = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setSearch(searchInput);
      await loadSubscribers(adminKey, 1, searchInput);
    } catch (err) {
      setError(err.message);
    }
  };

  const goToPage = async (page) => {
    if (page < 1 || page > subscriberTotalPages) return;
    setError("");
    try {
      await loadSubscribers(adminKey, page, search);
    } catch (err) {
      setError(err.message);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await api.adminVerify(verifyCode.trim().toUpperCase(), adminKey);
      setMessage(
        result.status === "verified"
          ? t("admin.verifiedMessage", {
              name: result.name,
              code: result.agent_code,
              voucherCode: result.voucher.code,
              amount: result.voucher.amount,
            })
          : t("admin.alreadyVerifiedMessage", { code: result.agent_code })
      );
      setVerifyCode("");
      loadSubscribers(adminKey);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateProductField = (field) => (e) => setProductForm({ ...productForm, [field]: e.target.value });

  const submitProduct = async (e) => {
    e.preventDefault();
    setProductError("");
    setProductSaving(true);
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => formData.append(key, value));
      if (productImage) formData.append("image", productImage);
      await api.adminCreateProduct(formData, adminKey);
      setProductForm(initialProductForm);
      setProductImage(null);
      document.getElementById("productImage").value = "";
      loadCatalogue();
    } catch (err) {
      setProductError(err.message);
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    setProductError("");
    try {
      await api.adminDeleteProduct(id, adminKey);
      loadCatalogue();
    } catch (err) {
      setProductError(err.message);
    }
  };

  const updateAdField = (field) => (e) => setAdForm({ ...adForm, [field]: e.target.value });

  const submitAd = async (e) => {
    e.preventDefault();
    setAdError("");
    if (!adImage) {
      setAdError(t("admin.adImageRequired"));
      return;
    }
    setAdSaving(true);
    try {
      const formData = new FormData();
      Object.entries(adForm).forEach(([key, value]) => formData.append(key, value));
      formData.append("image", adImage);
      await api.adminCreateAdvertisement(formData, adminKey);
      setAdForm(initialAdForm);
      setAdImage(null);
      document.getElementById("adImage").value = "";
      loadCatalogue();
    } catch (err) {
      setAdError(err.message);
    } finally {
      setAdSaving(false);
    }
  };

  const deleteAd = async (id) => {
    setAdError("");
    try {
      await api.adminDeleteAdvertisement(id, adminKey);
      loadCatalogue();
    } catch (err) {
      setAdError(err.message);
    }
  };

  if (!unlocked) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>{t("admin.loginTitle")}</h2>
          <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>{t("admin.loginSubtitle")}</p>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={login}>
            <div className="field">
              <label htmlFor="key">{t("admin.adminKey")}</label>
              <input id="key" type="password" required value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              {t("admin.unlock")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{t("admin.title")}</h2>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {error && <div className="error-box">{error}</div>}
          {message && (
            <div className="result-box" style={{ marginTop: 0, marginBottom: "1rem" }}>
              {message}
            </div>
          )}
          <form onSubmit={verify}>
            <div className="field">
              <label htmlFor="verifyCode">{t("admin.verifyCodeLabel")}</label>
              <input
                id="verifyCode"
                required
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="e.g. AT2026-1234567"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <button className="btn btn-secondary" type="submit" style={{ width: "100%" }}>
              {t("admin.verifyButton")}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-body">
            <form onSubmit={runSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                style={{ flex: 1, padding: "0.5rem 0.7rem", border: "1px solid #d8c493", borderRadius: "8px" }}
              />
              <button className="btn btn-secondary" type="submit">
                {t("admin.search")}
              </button>
              {search && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    loadSubscribers(adminKey, 1, "");
                  }}
                >
                  {t("admin.clear")}
                </button>
              )}
            </form>

            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("admin.tableAgentCode")}</th>
                    <th>{t("admin.tableName")}</th>
                    <th>{t("admin.tablePhone")}</th>
                    <th>{t("admin.tableTown")}</th>
                    <th>{t("admin.tableStatus")}</th>
                    <th>{t("admin.tableVoucher")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.agent_code}</td>
                      <td>{s.name}</td>
                      <td>{s.phone}</td>
                      <td>{s.town || "-"}</td>
                      <td>
                        <span className={`status-pill ${s.status === "verified" ? "status-verified" : "status-pending"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>{s.voucher ? `${s.voucher.code} (₹${s.voucher.amount})` : "-"}</td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#7a6a52" }}>
                        {search ? t("admin.noMatch") : t("admin.noSubscribers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {subscriberTotalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                <button
                  className="btn btn-outline"
                  style={{ color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  disabled={subscriberPage <= 1}
                  onClick={() => goToPage(subscriberPage - 1)}
                >
                  {t("admin.previous")}
                </button>
                <span style={{ fontSize: "0.85rem", color: "#7a6a52" }}>
                  {t("admin.pageInfo", { page: subscriberPage, totalPages: subscriberTotalPages, total: subscriberTotal })}
                </span>
                <button
                  className="btn btn-outline"
                  style={{ color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  disabled={subscriberPage >= subscriberTotalPages}
                  onClick={() => goToPage(subscriberPage + 1)}
                >
                  {t("admin.next")}
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="section-title">{t("admin.manageProducts")}</h2>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {productError && <div className="error-box">{productError}</div>}
          <form onSubmit={submitProduct}>
            <div className="field">
              <label htmlFor="pname">{t("admin.productName")}</label>
              <input
                id="pname"
                required
                value={productForm.name}
                onChange={updateProductField("name")}
                placeholder={t("admin.productNamePlaceholder")}
              />
            </div>
            <div className="field">
              <label htmlFor="pcategory">{t("admin.category")}</label>
              <input
                id="pcategory"
                value={productForm.category}
                onChange={updateProductField("category")}
                placeholder={t("admin.categoryPlaceholder")}
              />
            </div>
            <div className="field">
              <label htmlFor="pweight">{t("admin.weight")}</label>
              <input
                id="pweight"
                value={productForm.weight}
                onChange={updateProductField("weight")}
                placeholder={t("admin.weightPlaceholder")}
              />
            </div>
            <div className="field">
              <label htmlFor="pprice">{t("admin.price")}</label>
              <input id="pprice" type="number" min="1" required value={productForm.price} onChange={updateProductField("price")} />
            </div>
            <div className="field">
              <label htmlFor="pdescription">{t("admin.description")}</label>
              <textarea id="pdescription" rows={3} value={productForm.description} onChange={updateProductField("description")} />
            </div>
            <div className="field">
              <label htmlFor="productImage">{t("admin.productImage")}</label>
              <input
                id="productImage"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setProductImage(e.target.files[0] || null)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={productSaving} style={{ width: "100%" }}>
              {productSaving ? t("admin.uploading") : t("admin.addProduct")}
            </button>
          </form>
        </div>

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
                {p.weight && <div style={{ fontSize: "0.8rem", color: "#7a6a52", margin: "0.2rem 0" }}>{p.weight}</div>}
                <div className="product-price">&#8377;{p.price}</div>
                <button
                  className="btn btn-outline"
                  style={{ marginTop: "0.7rem", width: "100%", color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  onClick={() => deleteProduct(p.id)}
                >
                  {t("admin.remove")}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: "#7a6a52" }}>{t("admin.noProducts")}</p>}
        </div>

        <h2 className="section-title" style={{ marginTop: "2.5rem" }}>
          {t("admin.manageAds")}
        </h2>
        <p className="section-subtitle">{t("admin.manageAdsSubtitle")}</p>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {adError && <div className="error-box">{adError}</div>}
          <form onSubmit={submitAd}>
            <div className="field">
              <label htmlFor="adTitle">{t("admin.adTitle")}</label>
              <input
                id="adTitle"
                required
                value={adForm.title}
                onChange={updateAdField("title")}
                placeholder={t("admin.adTitlePlaceholder")}
              />
            </div>
            <div className="field">
              <label htmlFor="adLink">{t("admin.adLink")}</label>
              <input
                id="adLink"
                value={adForm.link}
                onChange={updateAdField("link")}
                placeholder={t("admin.adLinkPlaceholder")}
              />
            </div>
            <div className="field">
              <label htmlFor="adImage">{t("admin.adImage")}</label>
              <input
                id="adImage"
                type="file"
                required
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setAdImage(e.target.files[0] || null)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={adSaving} style={{ width: "100%" }}>
              {adSaving ? t("admin.uploading") : t("admin.addAd")}
            </button>
          </form>
        </div>

        <div className="product-grid">
          {ads.map((ad) => (
            <div className="card product-card" key={ad.id}>
              <div className="product-photo-frame">
                <img src={resolveImageUrl(ad.image_url)} alt={ad.title} className="product-photo" />
              </div>
              <div className="card-body">
                <div style={{ fontWeight: 700 }}>{ad.title}</div>
                {ad.link && <div style={{ fontSize: "0.8rem", color: "#7a6a52", margin: "0.2rem 0" }}>{ad.link}</div>}
                <button
                  className="btn btn-outline"
                  style={{ marginTop: "0.7rem", width: "100%", color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  onClick={() => deleteAd(ad.id)}
                >
                  {t("admin.remove")}
                </button>
              </div>
            </div>
          ))}
          {ads.length === 0 && <p style={{ color: "#7a6a52" }}>{t("admin.noAds")}</p>}
        </div>
      </div>
    </section>
  );
}
