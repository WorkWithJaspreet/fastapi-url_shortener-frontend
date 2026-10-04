import { useState, useEffect } from "react";
import api from "../api/api";

function Dashboard({ onLogout }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      const res = await api.get("/urls");
      setUrls(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      }
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const createUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/urls", {
        original_url: originalUrl,
        custom_slug: customSlug || null,
      });

      setOriginalUrl("");
      setCustomSlug("");
      setMessage("URL shortened successfully.");
      await fetchUrls();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not shorten URL.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (shortCode) => {
    if (!window.confirm("Delete this URL?")) return;

    try {
      await api.delete(`/urls/${shortCode}`);
      setMessage("URL deleted.");
      setAnalytics((prev) => {
        const next = { ...prev };
        delete next[shortCode];
        return next;
      });
      await fetchUrls();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Delete failed.");
    }
  };

  const loadAnalytics = async (shortCode) => {
    try {
      const res = await api.get(`/urls/${shortCode}/analytics`);
      setAnalytics((prev) => ({
        ...prev,
        [shortCode]: res.data,
      }));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not load analytics.");
    }
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard.");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    onLogout();
  };

  return (
    <div className="page">
      <header>
        <div>
          <h1>URL Shortener</h1>
          <p className="muted">Redis + PostgreSQL + FastAPI analytics</p>
        </div>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="card">
        <h2>Create short URL</h2>

        <form onSubmit={createUrl}>
          <input
            type="url"
            placeholder="https://example.com/very/long/url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Custom slug (optional), e.g. github"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            pattern="[A-Za-z0-9_-]{3,50}"
            title="3-50 letters, numbers, underscores or hyphens"
          />

          <button className="primary" disabled={loading}>
            {loading ? "Creating..." : "Shorten URL"}
          </button>
        </form>

        {message && <div className="notice">{message}</div>}
      </section>

      <section className="card">
        <h2>Your URLs</h2>

        {urls.length === 0 ? (
          <p className="muted">No URLs created yet.</p>
        ) : (
          <div className="url-list">
            {urls.map((url) => {
              const stat = analytics[url.short_code];

              return (
                <article className="url-item" key={url.short_code}>
                  <div className="url-main">
                    <div className="original">{url.original_url}</div>

                    <a href={url.short_url} target="_blank" rel="noreferrer">
                      {url.short_url}
                    </a>
                  </div>

                  <div className="actions">
                    <button
                      className="secondary"
                      onClick={() => copy(url.short_url)}
                    >
                      Copy
                    </button>

                    <button
                      className="secondary"
                      onClick={() => loadAnalytics(url.short_code)}
                    >
                      Analytics
                    </button>

                    <button
                      className="danger"
                      onClick={() => deleteUrl(url.short_code)}
                    >
                      Delete
                    </button>
                  </div>

                  {stat && (
                    <div className="analytics">
                      <strong>{stat.total_clicks}</strong> total clicks
                      <span>•</span>
                      <strong>{stat.unique_visitors}</strong> unique visitors
                      <span>•</span>
                      Last click:{" "}
                      {stat.last_clicked_at
                        ? new Date(stat.last_clicked_at).toLocaleString()
                        : "Never"}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
