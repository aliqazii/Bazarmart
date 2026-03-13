import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaTachometerAlt, FaBars, FaTimes, FaStore, FaHeart, FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Header = () => {
  const { user, wishlist } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  // Cart count
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
    };
    updateCount();
    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Search autocomplete
  useEffect(() => {
    if (searchQuery.length < 2) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/products/search/autocomplete?q=${encodeURIComponent(searchQuery)}`
        );
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      closeMenu();
    }
  };

  const handleSearchChange = (e) => {
    const nextValue = e.target.value;
    setSearchQuery(nextValue);

    if (nextValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery("");
    setShowSuggestions(false);
    closeMenu();
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <FaStore className="logo-icon" /> Bazarmart
        </Link>

        {/* Search bar */}
        <div className="header-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {suggestions.map((item) => (
                <div
                  key={item._id}
                  className="autocomplete-item"
                  onClick={() => handleSuggestionClick(item._id)}
                >
                  <img
                    src={item.images?.[0]?.url || "https://placehold.co/40x40"}
                    alt={item.name}
                  />
                  <div className="autocomplete-item-info">
                    <span>{item.name}</span>
                    <small>{item.category}</small>
                  </div>
                  <span className="autocomplete-item-price">${item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/products" onClick={closeMenu}>Products</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          <Link to="/cart" className="mobile-nav-link" onClick={closeMenu}>Cart</Link>

          <div className="nav-icon-group">
            {user && (
              <Link to="/wishlist" className="nav-icon-link wishlist-link" onClick={closeMenu}>
                <FaHeart />
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </Link>
            )}

            <Link to="/cart" className="nav-icon-link cart-link" onClick={closeMenu}>
              <FaShoppingCart />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </Link>
          </div>

          {user ? (
            <>
              <Link to="/orders" onClick={closeMenu}>Orders</Link>
              {user.role === "admin" && (
                <Link to="/admin/dashboard" onClick={closeMenu}>
                  <FaTachometerAlt /> Admin
                </Link>
              )}
              <Link to="/profile" onClick={closeMenu}>
                <FaUser /> {user.name}
              </Link>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu}>Login</Link>
          )}
        </nav>
      </div>
      {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}
    </header>
  );
};

export default Header;
