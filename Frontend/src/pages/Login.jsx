import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import PublicNavbar from "../components/PublicNavbar";
import "../styles/Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [translations, setTranslations] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const loadTranslations = async () => {
    try {
      const response = await api.getTranslations("login", language);
      if (response.success) {
        setTranslations(response.data);
        setTranslationsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load translations:", err);
      setError("Failed to load translations");
    }
  };

  const getText = (key) => {
    return translations[key] || key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(email, password);
      if (response.success && response.data.token) {
        // Store user info in localStorage
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        onLogin(response.data.token);
        navigate("/pricelist");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const menuItems = [
    { to: "/login", label: getText("login_title") },
    { to: "/register", label: getText("register_link") },
    { to: "/terms", label: getText("terms_link") },
    { to: "/privacy", label: getText("privacy_link") },
  ];

  if (!translationsLoaded) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="login-container">
      <div
        className="background-image"
        style={{
          backgroundImage:
            "url(https://storage.123fakturera.se/public/wallpapers/sverige43.jpg)",
        }}
      />

      <PublicNavbar
        language={language}
        onLanguageChange={toggleLanguage}
        menuItems={menuItems}
      />

      <div className="login-content">
        <div className="login-card">
          <h1>{getText("login_title") || "Log in"}</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Enter your email address</label>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enter your password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.69-1.64 1.72-3.19 3.05-4.52M10.59 10.59A2 2 0 1 0 12 14a2 2 0 0 0-1.41-.59Z" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Loading..." : "Log in"}
            </button>
          </form>

          <div className="login-links">
            <Link to="/register">Register</Link>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgotten password?
            </a>
          </div>
        </div>
      </div>

      <footer className="login-footer">
        <div className="footer-left">
          <h2>123 Fakturera</h2>
          <hr className="footer-divider" />
          <p className="footer-copyright">
            © Läftfaktura, ORO no. 638537, 2025. All rights reserved.
          </p>
        </div>
        <div className="footer-right">
          <Link to="/">{getText("footer_home") || "Home"}</Link>
          <a href="#order">{getText("footer_order") || "Order"}</a>
          <a href="#contact">{getText("footer_contact") || "Contact us"}</a>
        </div>
      </footer>
    </div>
  );
}

export default Login;
