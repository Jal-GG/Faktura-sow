import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/PriceList.css";
import {
  InvoicesIcon,
  CustomersIcon,
  BusinessIcon,
  JournalIcon,
  PriceListIcon,
  MultipleInvoicingIcon,
  UnpaidInvoicesIcon,
  OfferIcon,
  InventoryIcon,
  MemberInvoicingIcon,
  ImportExportIcon,
  LogoutIcon,
} from "../components/icons.jsx";

function Pricelist({ onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "english";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { email: "", name: "" };
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const updateTimeouts = useRef({});
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [newProduct, setNewProduct] = useState({
    articleNo: "",
    productService: "",
    inPrice: "",
    price: "",
    unit: "",
    inStock: "",
    description: "",
  });

  useEffect(() => {
    loadProducts();
    loadTranslations();
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [language]);

  useEffect(() => {
    return () => {
      Object.values(updateTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const loadTranslations = async () => {
    try {
      const response = await api.getTranslations("pricelist", language);
      if (response.success) {
        setTranslations(response.data);
      }
    } catch (err) {
      console.error("Failed to load translations:", err);
      setTranslations({});
    }
  };

  const getText = (key) => {
    return translations[key] || key;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Create menuItems array that updates when translations change
  const menuItems = [
    {
      id: "invoices",
      label: translations.menu_invoices || "Invoices",
      icon: <InvoicesIcon />,
      active: false,
    },
    {
      id: "customers",
      label: translations.menu_customers || "Customers",
      icon: <CustomersIcon />,
      active: false,
    },
    {
      id: "business",
      label: translations.menu_business || "My Business",
      icon: <BusinessIcon />,
      active: false,
    },
    {
      id: "journal",
      label: translations.menu_journal || "Invoice Journal",
      icon: <JournalIcon />,
      active: false,
    },
    {
      id: "pricelist",
      label: translations.menu_pricelist || "Price List",
      icon: <PriceListIcon />,
      active: true,
    },
    {
      id: "multiple",
      label: translations.menu_multiple || "Multiple Invoicing",
      icon: <MultipleInvoicingIcon />,
      active: false,
    },
    {
      id: "unpaid",
      label: translations.menu_unpaid || "Unpaid Invoices",
      icon: <UnpaidInvoicesIcon />,
      active: false,
    },
    {
      id: "offer",
      label: translations.menu_offer || "Offer",
      icon: <OfferIcon />,
      active: false,
    },
    {
      id: "inventory",
      label: translations.menu_inventory || "Inventory Control",
      icon: <InventoryIcon />,
      active: false,
    },
    {
      id: "member",
      label: translations.menu_member || "Member Invoicing",
      icon: <MemberInvoicingIcon />,
      active: false,
    },
    {
      id: "import",
      label: translations.menu_import || "Import/Export",
      icon: <ImportExportIcon />,
      active: false,
    },
    {
      id: "logout",
      label: translations.menu_logout || "Log out",
      icon: <LogoutIcon />,
      active: false,
    },
  ];

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.getProducts(token, 1, 50);
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleMenuItemClick = (itemId) => {
    if (itemId === "logout") {
      handleLogout();
    }
    setSidebarOpen(false);
  };

  const handleAddProductClick = () => {
    setShowAddModal(true);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewProduct({
      articleNo: "",
      productService: "",
      inPrice: "",
      price: "",
      unit: "",
      inStock: "",
      description: "",
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const productData = {
        articleNo: newProduct.articleNo,
        productService: newProduct.productService,
        inPrice: newProduct.inPrice ? parseFloat(newProduct.inPrice) : null,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit || null,
        inStock: newProduct.inStock ? parseInt(newProduct.inStock) : null,
        description: newProduct.description || null,
      };

      const response = await api.createProduct(token, productData);
      if (response.success) {
        setProducts([response.data.product, ...products]);
        handleCancelAdd();
        setError("");
      }
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

  const handleProductUpdate = (id, field, value) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    const timeoutKey = `${id}-${field}`;
    if (updateTimeouts.current[timeoutKey]) {
      clearTimeout(updateTimeouts.current[timeoutKey]);
    }

    updateTimeouts.current[timeoutKey] = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        const updateData = {};

        if (field === "article_no") updateData.articleNo = value;
        else if (field === "product_service") updateData.productService = value;
        else if (field === "in_price")
          updateData.inPrice = value ? parseFloat(value) : null;
        else if (field === "price")
          updateData.price = value ? parseFloat(value) : null;
        else if (field === "unit") updateData.unit = value;
        else if (field === "in_stock")
          updateData.inStock = value ? parseInt(value) : null;
        else if (field === "description") updateData.description = value;

        await api.updateProduct(token, id, updateData);
        delete updateTimeouts.current[timeoutKey];
      } catch (err) {
        console.error("Update failed:", err);
        setError("Failed to update product");
      }
    }, 800); // 800ms debounce delay
  };

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "swedish" : "english";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const selectLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    setLanguageDropdownOpen(false);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesArticle =
        !searchArticle ||
        product.article_no?.toLowerCase().includes(searchArticle.toLowerCase());
      const matchesProduct =
        !searchProduct ||
        product.product_service
          ?.toLowerCase()
          .includes(searchProduct.toLowerCase());
      return matchesArticle && matchesProduct;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="pricelist-container">
      <header className="pricelist-header">
        <button
          className="hamburger-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="header-user-profile">
          <div className="header-user-avatar">
            <img
              src="https://png.pngtree.com/png-clipart/20190924/original/pngtree-human-avatar-free-vector-png-image_4825373.jpg"
              alt="User"
            />
          </div>
          <div className="header-user-info">
            <h3>{user.email || "John Andre"}</h3>
            <p>{user.company || "Stortford AS"}</p>
          </div>
        </div>

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

      <div className="pricelist-body">
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-menu-title">{getText("menu") || "Menu"}</div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-menu-item ${item.active ? "active" : ""}`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="sidebar-overlay active"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="main-content">
          <div className="search-section">
            <div className="search-inputs-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder={getText("search_article")}
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
              />
              <input
                type="text"
                className="search-input"
                placeholder={getText("search_product")}
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>

            <div className="action-buttons">
              <button
                className="action-btn new-product"
                onClick={handleAddProductClick}
              >
                <span className="btn-icon">+</span>
                <span className="btn-text">{getText("new_product")}</span>
              </button>
              <button className="action-btn print-list">
                <span className="btn-icon">🖨</span>
                <span className="btn-text">{getText("print_list")}</span>
              </button>
              <button className="action-btn advanced-mode">
                <span className="btn-icon">⚙</span>
                <span className="btn-text">{getText("advanced_mode")}</span>
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showAddModal && (
            <div className="modal-overlay" onClick={handleCancelAdd}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{getText("new_product")}</h2>
                  <button className="modal-close" onClick={handleCancelAdd}>
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateProduct} className="product-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{getText("article_no")} *</label>
                      <input
                        type="text"
                        value={newProduct.articleNo}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            articleNo: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{getText("price")} *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{getText("product_service")} *</label>
                    <input
                      type="text"
                      value={newProduct.productService}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productService: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{getText("in_price")}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.inPrice}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            inPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>{getText("unit")}</label>
                      <input
                        type="text"
                        value={newProduct.unit}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, unit: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>{getText("in_stock")}</label>
                      <input
                        type="number"
                        value={newProduct.inStock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            inStock: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{getText("description")}</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                    />
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancelAdd}
                    >
                      {getText("cancel") || "Cancel"}
                    </button>
                    <button type="submit" className="btn-save">
                      {getText("save_product") || "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="products-table-container">
            <div className="table-wrapper">
              <table className="products-table desktop-table">
                <thead>
                  <tr>
                    <th></th>
                    <th
                      onClick={() => handleSort("article_no")}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {getText("article_no")}
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "18px",
                          color: "#4caf50",
                          fontWeight: "bold",
                        }}
                      >
                        {sortField === "article_no"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSort("product_service")}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {getText("product_service")}
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "18px",
                          color: "#4caf50",
                          fontWeight: "bold",
                        }}
                      >
                        {sortField === "product_service"
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </th>
                    <th>{getText("in_price")}</th>
                    <th>{getText("price")}</th>
                    <th>{getText("unit")}</th>
                    <th>{getText("in_stock")}</th>
                    <th>{getText("description")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td className="arrow-cell">
                        {index === filteredProducts.length - 1 ? "→" : ""}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={product.article_no || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "article_no",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={product.product_service || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "product_service",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={product.in_price || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "in_price",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={product.price || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "price",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={product.unit || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "unit",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={product.in_stock || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "in_stock",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={product.description || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="actions-cell">
                        <button className="more-btn">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-products">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-card">
                  <div className="product-row">
                    <span className="arrow">
                      {index === filteredProducts.length - 1 ? "→" : ""}
                    </span>
                    <div className="product-info">
                      <div className="product-field">
                        <label>{getText("product_service")}</label>
                        <input
                          type="text"
                          value={product.product_service || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "product_service",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="product-field">
                        <label>{getText("price")}</label>
                        <input
                          type="number"
                          value={product.price || ""}
                          onChange={(e) =>
                            handleProductUpdate(
                              product.id,
                              "price",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <button className="more-btn">⋯</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricelist;
