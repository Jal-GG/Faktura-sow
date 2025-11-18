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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    { to: "/login", label: getText("register_login_link") },
    { to: "/register", label: getText("register_title") },
    { to: "/terms", label: getText("register_terms_link") },
    { to: "/privacy", label: getText("register_privacy_link") },
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
              <label className="form-label">
                {getText("register_email_label")}
              </label>
              <input
                type="email"
                placeholder={getText("register_email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {getText("register_password_label")}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={getText("register_password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
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

            <div className="form-group">
              <label className="form-label">
                {getText("register_confirm_password_label")}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={getText("register_confirm_password_placeholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? getText("register_loading_text")
                : getText("register_button_text")}
            </button>
          </form>

          <div className="register-links">
            <p>
              {getText("register_already_have_account")}{" "}
              <Link to="/login">{getText("register_login_link")}</Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="register-footer">
        <div className="footer-top">
          <div className="footer-left">
            <h2>{getText("register_footer_company_name")}</h2>
          </div>
          <div className="footer-right">
            <Link to="/">{getText("register_footer_home")}</Link>
            <Link to="/order">{getText("register_footer_order")}</Link>
            <Link to="/contact">{getText("register_footer_contact")}</Link>
          </div>
        </div>
        <hr className="footer-divider" />
        <p className="footer-copyright">
          {getText("register_footer_copyright")}
        </p>
      </footer>
    </div>
  );
}

export default Register;
