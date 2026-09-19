import { useState } from "react";
import { api, resolveImageUrl } from "../api.js";

const initialProductForm = { name: "", category: "", weight: "", price: "", description: "" };
const initialAdForm = { title: "", link: "" };

const SUBSCRIBERS_PER_PAGE = 50;

export default function Admin() {
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
          ? `Verified ${result.name} (${result.agent_code}). Gift voucher ${result.voucher.code} for ₹${result.voucher.amount} issued.`
          : `${result.agent_code} is already verified.`
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
      setAdError("Please choose an image for the advertisement.");
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
          <h2>Admin Login</h2>
          <p style={{ color: "#7a6a52", marginTop: "-0.5rem" }}>
            Trust office staff only. Enter the admin key to verify agent codes and manage the product catalogue.
          </p>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={login}>
            <div className="field">
              <label htmlFor="key">Admin Key</label>
              <input id="key" type="password" required value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Admin - Agent Verification</h2>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {error && <div className="error-box">{error}</div>}
          {message && (
            <div className="result-box" style={{ marginTop: 0, marginBottom: "1rem" }}>
              {message}
            </div>
          )}
          <form onSubmit={verify}>
            <div className="field">
              <label htmlFor="verifyCode">Agent Code to Verify</label>
              <input
                id="verifyCode"
                required
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="e.g. AT2026-12345"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <button className="btn btn-secondary" type="submit" style={{ width: "100%" }}>
              Verify &amp; Issue ₹250 Voucher
            </button>
          </form>
        </div>

        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-body">
            <form onSubmit={runSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, phone, or agent code"
                style={{ flex: 1, padding: "0.5rem 0.7rem", border: "1px solid #d8c493", borderRadius: "8px" }}
              />
              <button className="btn btn-secondary" type="submit">
                Search
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
                  Clear
                </button>
              )}
            </form>

            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Agent Code</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Town</th>
                    <th>Status</th>
                    <th>Voucher</th>
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
                        {search ? "No subscribers match your search." : "No subscribers yet."}
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
                  Previous
                </button>
                <span style={{ fontSize: "0.85rem", color: "#7a6a52" }}>
                  Page {subscriberPage} of {subscriberTotalPages} &middot; {subscriberTotal} subscribers
                </span>
                <button
                  className="btn btn-outline"
                  style={{ color: "#6b0f1a", borderColor: "#6b0f1a" }}
                  disabled={subscriberPage >= subscriberTotalPages}
                  onClick={() => goToPage(subscriberPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="section-title">Manage Product Catalogue</h2>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {productError && <div className="error-box">{productError}</div>}
          <form onSubmit={submitProduct}>
            <div className="field">
              <label htmlFor="pname">Product Name *</label>
              <input id="pname" required value={productForm.name} onChange={updateProductField("name")} placeholder="e.g. Ponni Boiled Rice" />
            </div>
            <div className="field">
              <label htmlFor="pcategory">Category</label>
              <input id="pcategory" value={productForm.category} onChange={updateProductField("category")} placeholder="e.g. Grocery" />
            </div>
            <div className="field">
              <label htmlFor="pweight">Weight / Variant</label>
              <input id="pweight" value={productForm.weight} onChange={updateProductField("weight")} placeholder="e.g. 5 Kg" />
            </div>
            <div className="field">
              <label htmlFor="pprice">Price (&#8377;) *</label>
              <input id="pprice" type="number" min="1" required value={productForm.price} onChange={updateProductField("price")} />
            </div>
            <div className="field">
              <label htmlFor="pdescription">Description</label>
              <textarea id="pdescription" rows={3} value={productForm.description} onChange={updateProductField("description")} />
            </div>
            <div className="field">
              <label htmlFor="productImage">Product Image</label>
              <input
                id="productImage"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setProductImage(e.target.files[0] || null)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={productSaving} style={{ width: "100%" }}>
              {productSaving ? "Uploading..." : "Add Product"}
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
                  <span className="product-photo-placeholder">No image</span>
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
                  Remove
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: "#7a6a52" }}>No products in the catalogue yet.</p>}
        </div>

        <h2 className="section-title" style={{ marginTop: "2.5rem" }}>
          Manage Advertisements
        </h2>
        <p className="section-subtitle">Shown as the home page carousel, in the order added</p>

        <div className="form-card" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          {adError && <div className="error-box">{adError}</div>}
          <form onSubmit={submitAd}>
            <div className="field">
              <label htmlFor="adTitle">Advertisement Title *</label>
              <input id="adTitle" required value={adForm.title} onChange={updateAdField("title")} placeholder="e.g. New Year Offer" />
            </div>
            <div className="field">
              <label htmlFor="adLink">Link (where it goes when clicked)</label>
              <input id="adLink" value={adForm.link} onChange={updateAdField("link")} placeholder="e.g. /products" />
            </div>
            <div className="field">
              <label htmlFor="adImage">Advertisement Image *</label>
              <input
                id="adImage"
                type="file"
                required
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setAdImage(e.target.files[0] || null)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={adSaving} style={{ width: "100%" }}>
              {adSaving ? "Uploading..." : "Add Advertisement"}
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
                  Remove
                </button>
              </div>
            </div>
          ))}
          {ads.length === 0 && <p style={{ color: "#7a6a52" }}>No advertisements yet.</p>}
        </div>
      </div>
    </section>
  );
}
