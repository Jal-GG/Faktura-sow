import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import "../styles/Register.css";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      const response = await api.getTranslations("register", language);
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
    return translations["register_" + key] || translations[key] || key;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(getText("password_requirements"));
      return;
    }

    if (password !== confirmPassword) {
      setError(getText("passwords_no_match"));
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(email, password);
      if (response.success && response.data.token) {
        onRegister(response.data.token);
        navigate("/pricelist");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
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
    <div className="register-container">
      <div
        className="background-image"
        style={{
          backgroundImage:
            "url(https://storage.123fakturera.se/public/wallpapers/sverige43.jpg)",
        }}
      />

      <header className="register-header">
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
          <span>{language === "english" ? "English" : "Svenska"}</span>
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
              <Link to="/register">{getText("register_title")}</Link>
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

      <div className="register-content">
        <div className="register-card">
          <h1>{getText("register_title")}</h1>

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
                minLength={6}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder={getText("confirm_password_placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <p className="password-hint">{getText("password_requirements")}</p>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Loading..." : getText("register_button")}
            </button>
          </form>

          <div className="register-links">
            <p>
              {getText("already_have_account")}{" "}
              <Link to="/login">{getText("login_link")}</Link>
            </p>
            <Link to="/terms">{getText("terms_link")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
