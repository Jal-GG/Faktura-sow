import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import PublicNavbar from "../components/PublicNavbar";
import "../styles/Terms.css";

function Terms() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "swedish";
  });
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTranslations();
  }, [language]);

  const loadTranslations = async () => {
    try {
      setLoading(true);
      const response = await api.getTranslations("terms", language);
      if (response.success) {
        setTranslations(response.data);
      }
    } catch (err) {
      console.error("Failed to load translations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getText = (key) => {
    return translations[key] || key;
  };

  const toggleLanguageMenu = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const menuItems = [
    { to: "/login", label: getText("terms_menu_home") },
    { href: "#order", label: getText("terms_menu_order") },
    { href: "#customers", label: getText("terms_menu_customers") },
    { href: "#about", label: getText("terms_menu_about") },
    { href: "#contact", label: getText("terms_menu_contact") },
  ];

  if (loading) {
    return (
      <div className="terms-page">
        <div
          className="background-image"
          style={{
            backgroundImage:
              "url(https://storage.123fakturera.se/public/wallpapers/sverige43.jpg)",
          }}
        />
        <div className="loading-container">
          {getText("terms_loading") || "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="terms-page">
      <div
        className="background-image"
        style={{
          backgroundImage:
            "url(https://storage.123fakturera.se/public/wallpapers/sverige43.jpg)",
        }}
      />

      <PublicNavbar
        language={language}
        onLanguageChange={toggleLanguageMenu}
        menuItems={menuItems}
      />

      <div className="terms-content">
        <h1 className="terms-title">{getText("terms_title")}</h1>

        <button className="close-button" onClick={() => navigate("/login")}>
          {getText("terms_close_button")}
        </button>

        {error && (
          <div className="error-box">
            {getText("terms_error")}: {error}
          </div>
        )}

        <div className="terms-box">
          {getText("terms_content") &&
            getText("terms_content")
              .split("\n\n")
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>

        <button className="close-button" onClick={() => navigate("/login")}>
          {getText("terms_close_button")}
        </button>
      </div>
    </div>
  );
}

export default Terms;
