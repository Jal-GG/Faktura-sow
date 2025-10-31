import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import PublicNavbar from "../components/PublicNavbar";
import "../styles/Register.css";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
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

  const toggleLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const menuItems = [
    { to: "/login", label: getText("login_title") },
    { to: "/register", label: getText("register_title") },
    { to: "/terms", label: getText("terms_link") },
    { href: "#", label: getText("privacy_link") },
  ];

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

      <PublicNavbar
        language={language}
        onLanguageChange={toggleLanguage}
        menuItems={menuItems}
      />

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
