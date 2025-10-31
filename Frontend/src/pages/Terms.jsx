// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../services/api";
// import "../styles/Terms.css";

// function Terms() {
//   const navigate = useNavigate();
//   const [language, setLanguage] = useState("english");
//   const [translations, setTranslations] = useState({});
//   const [translationsLoaded, setTranslationsLoaded] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     loadTranslations();
//   }, [language]);

//   const loadTranslations = async () => {
//     setTranslationsLoaded(false);
//     try {
//       const response = await api.getTranslations("terms", language);
//       if (response.success) {
//         setTranslations(response.data);
//         setTranslationsLoaded(true);
//       }
//     } catch (err) {
//       console.error("Failed to load translations:", err);
//       setError("Failed to load translations");
//     }
//   };

//   const toggleLanguage = () => {
//     setLanguage(language === "english" ? "swedish" : "english");
//   };

//   const getText = (key) => {
//     return translations[key] || key;
//   };

//   if (!translationsLoaded) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="terms-container">
//       <header className="terms-header">
//         <h1>{getText("terms_title")}</h1>
//         <button className="language-toggle" onClick={toggleLanguage}>
//           <span>{language === "english" ? "English" : "Svenska"}</span>
//           <img
//             src={
//               language === "english"
//                 ? "https://storage.123fakturere.no/public/flags/GB.png"
//                 : "https://storage.123fakturere.no/public/flags/SE.png"
//             }
//             alt="Flag"
//             className="flag-icon"
//           />
//         </button>
//       </header>

//       {error && <div className="error-message">{error}</div>}

//       <div className="terms-content">
//         <div className="terms-intro">
//           <p>{getText("terms_content")}</p>
//         </div>

//         <section className="terms-section">
//           <h2>{getText("terms_section1_title")}</h2>
//           <p>{getText("terms_section1_content")}</p>
//         </section>

//         <section className="terms-section">
//           <h2>{getText("terms_section2_title")}</h2>
//           <p>{getText("terms_section2_content")}</p>
//         </section>

//         <section className="terms-section">
//           <h2>{getText("terms_section3_title")}</h2>
//           <p>{getText("terms_section3_content")}</p>
//         </section>

//         <div className="terms-actions">
//           <button className="back-button" onClick={() => navigate("/login")}>
//             {getText("back_button")}
//           </button>
//           <button className="accept-button" onClick={() => navigate("/login")}>
//             {getText("accept_button")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Terms;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import "../styles/Terms.css";

function Terms() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "swedish";
  });
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTermsFromDB();
  }, [language]);

  const fetchTermsFromDB = async () => {
    try {
      setLoading(true);
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_BASE_URL}/translations/terms`);

      if (!response.ok) {
        throw new Error("Failed to fetch terms");
      }

      const data = await response.json();

      if (data.success && data.data) {
        setTranslations(data.data.translations);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error("Error fetching terms:", err);
      setError(err.message);
      setTranslations(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = () => {
    return {
      english: {
        terms_title: "Terms",
        close_button: "Close and Go Back",
        terms_content: "Terms and conditions content...",
      },
      swedish: {
        terms_title: "Terms",
        close_button: "Stäng och gå tillbaka",
        terms_content: "Villkor innehåll...",
      },
    };
  };

  const toggleLanguageMenu = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const menuItems = [
    { to: "/login", label: "Home" },
    { href: "#order", label: "Order" },
    { href: "#customers", label: "Our Customers" },
    { href: "#about", label: "About us" },
    { href: "#contact", label: "Contact Us" },
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
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  const content = translations
    ? translations[language]
    : getDefaultContent()[language];

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
        <h1 className="terms-title">{content.terms_title || "Terms"}</h1>

        <button className="close-button" onClick={() => navigate("/login")}>
          {content.close_button || "Close and Go Back"}
        </button>

        {error && <div className="error-box">Error loading terms: {error}</div>}

        <div className="terms-box">
          {content.terms_content &&
            content.terms_content
              .split("\n\n")
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </div>
    </div>
  );
}

export default Terms;
