import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import "../styles/Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [menuOpen, setMenuOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

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
        onLogin(response.data.token);
        navigate("/pricelist");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "swedish" : "english");
  };

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

      <header className="login-header">
        <button
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <img
          src="https://storage.123fakturera.se/public/icons/diamond.png"
          alt="Logo"
          className="logo"
        />

        <button className="language-toggle" onClick={toggleLanguage}>
          <span>{getText("language")}</span>
          <img
            src={
              language === "english"
                ? "https://storage.123fakturere.no/public/flags/GB.png"
                : "https://storage.123fakturere.no/public/flags/SE.png"
            }
            alt="Flag"
            className="flag-icon"
          />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            <li>
              <Link to="/login">{getText("login_title")}</Link>
            </li>
            <li>
              <Link to="/register">{getText("register_link")}</Link>
            </li>
            <li>
              <Link to="/terms">{getText("terms_link")}</Link>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                {getText("privacy_link")}
              </a>
            </li>
          </ul>
        </div>
      )}

      <div className="login-content">
        <div className="login-card">
          <h1>{getText("login_title")}</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder={getText("email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder={getText("password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Loading..." : getText("login_button")}
            </button>
          </form>

          <div className="login-links">
            <a href="#" onClick={(e) => e.preventDefault()}>
              {getText("forgot_password")}
            </a>
            <Link to="/register">{getText("register_link")}</Link>
            <Link to="/terms">{getText("terms_link")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
