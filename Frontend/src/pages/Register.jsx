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
    return translations[key] || key.replace(/_/g, " ");
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
    { to: "/login", label: getText("login_title") || "Login" },
    { to: "/register", label: "Register" },
    { to: "/terms", label: getText("terms_link") || "Terms" },
    { href: "#", label: getText("privacy_link") || "Privacy Policy" },
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
          <h1>{getText("register_title") || "Register"}</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder={getText("email_placeholder") || "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder={getText("password_placeholder") || "Password"}
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
                placeholder={getText("Confirm password") || "Confirm password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <p className="password-hint">
              {getText("password_requirements") ||
                "Password must be at least 6 characters"}
            </p>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>

          <div className="register-links">
            <p>
              Already have an account?{" "}
              <Link to="/login">{getText("login_title") || "Login"}</Link>
            </p>
            <Link to="/terms">{getText("terms_link") || "Terms"}</Link>
          </div>
        </div>
      </div>

      <footer className="register-footer">
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

export default Register;
