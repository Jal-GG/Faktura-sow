import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/PublicNavbar.css";

function PublicNavbar({ language, onLanguageChange, menuItems = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const selectLanguage = (newLanguage) => {
    onLanguageChange(newLanguage);
    setLanguageDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        mobileMenuRef.current &&
        hamburgerRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="public-header">
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

        <ul className="nav-links-horizontal">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.to ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <a
                  href={item.href || "#"}
                  onClick={(e) => {
                    if (!item.href || item.href === "#") {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="language-dropdown-wrapper">
          <button
            className="language-toggle"
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
          >
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

          {languageDropdownOpen && (
            <div className="language-dropdown">
              <button
                className={`language-option ${
                  language === "swedish" ? "active" : ""
                }`}
                onClick={() => selectLanguage("swedish")}
              >
                <span>Svenska</span>
                <img
                  src="https://storage.123fakturere.no/public/flags/SE.png"
                  alt="Swedish"
                  className="flag-icon"
                />
              </button>
              <button
                className={`language-option ${
                  language === "english" ? "active" : ""
                }`}
                onClick={() => selectLanguage("english")}
              >
                <span>English</span>
                <img
                  src="https://storage.123fakturere.no/public/flags/GB.png"
                  alt="English"
                  className="flag-icon"
                />
              </button>
            </div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.to ? (
                  <Link to={item.to} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href || "#"}
                    onClick={(e) => {
                      if (!item.href || item.href === "#") {
                        e.preventDefault();
                      }
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default PublicNavbar;
