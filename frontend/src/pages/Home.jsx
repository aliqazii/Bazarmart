import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaHeadset,
  FaArrowRight,
  FaLaptop,
  FaTshirt,
  FaBook,
  FaShoePrints,
  FaGem,
  FaCouch,
  FaFootballBall,
  FaStar,
  FaFire,
  FaBolt,
  FaShoppingBag,
  FaPercentage,
} from "react-icons/fa";
import useDocumentMeta from "../hooks/useDocumentMeta";

const categories = [
  { name: "Electronics", icon: FaLaptop, color: "#3b82f6", bg: "#eff6ff" },
  { name: "Clothing", icon: FaTshirt, color: "#8b5cf6", bg: "#f5f3ff" },
  { name: "Books", icon: FaBook, color: "#10b981", bg: "#ecfdf5" },
  { name: "Shoes", icon: FaShoePrints, color: "#f59e0b", bg: "#fffbeb" },
  { name: "Accessories", icon: FaGem, color: "#ec4899", bg: "#fdf2f8" },
  { name: "Home", icon: FaCouch, color: "#6366f1", bg: "#eef2ff" },
  { name: "Sports", icon: FaFootballBall, color: "#14b8a6", bg: "#f0fdfa" },
];

const Home = () => {
  useDocumentMeta({
    title: "Bazarmart - Premium Online Store",
    description: "Shop electronics, clothing, books and more with secure checkout and fast delivery at Bazarmart.",
  });

  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState({});
  const featuredRef = useRef(null);
  const trendingRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured (page 1), trending (page 2), deals (page 3)
        const [featRes, trendRes, dealRes] = await Promise.all([
          axios.get("/api/v1/products?page=1"),
          axios.get("/api/v1/products?page=2"),
          axios.get("/api/v1/products?page=3"),
        ]);
        setFeatured(featRes.data.products);
        setTrending(trendRes.data.products);
        setDeals(dealRes.data.products);

        // Fetch hero showcase products from diverse categories
        const heroSearches = [
          "MacBook Pro",
          "Air Jordan",
          "iPhone 13 Pro",
          "Prada Women Bag",
        ];
        const heroResults = await Promise.all(
          heroSearches.map((kw) =>
            axios.get(`/api/v1/products?keyword=${encodeURIComponent(kw)}`).catch(() => null)
          )
        );
        const heroPicks = heroResults
          .map((r) => r?.data?.products?.[0])
          .filter(Boolean);
        setHeroProducts(heroPicks.length >= 4 ? heroPicks : featRes.data.products.slice(0, 4));

        // Fetch category counts
        const counts = {};
        await Promise.all(
          categories.map(async (cat) => {
            try {
              const { data } = await axios.get(`/api/v1/products?category=${cat.name}&page=1`);
              counts[cat.name] = data.productsCount;
            } catch { counts[cat.name] = 0; }
          })
        );
        setCategoryCounts(counts);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("home-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    [featuredRef, trendingRef, categoryRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="home-loader">
        <div className="home-loader-spinner" />
        <p>Loading amazing products...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-bg" />
        {/* Animated particles */}
        <div className="hero-particles">
          <span /><span /><span /><span /><span /><span /><span /><span />
        </div>

        <div className="hero-content">
          <span className="hero-badge">
            <FaBolt /> New Season 2026
          </span>
          <h1>
            <span className="hero-line hero-line-1">Premium Products,</span>
            <span className="hero-line hero-line-2 hero-gradient-text">Unbeatable Prices</span>
          </h1>
          <p className="hero-description">
            Discover curated collections across electronics, fashion, home &amp; more.
            Free shipping on orders over $50.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="hero-btn-primary">
              <FaShoppingBag /> Shop Now <FaArrowRight />
            </Link>
            <Link to="/products?category=Electronics" className="hero-btn-secondary">
              Explore Electronics
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>200+</strong>
              <span>Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>7</strong>
              <span>Categories</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          {/* Product grid showcase */}
          <div className="hero-grid">
            {heroProducts.map((product, i) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className={`hero-product-card hero-product-card-${i + 1}`}
              >
                <div className="hero-product-img">
                  <img src={product.images?.[0]?.url} alt={product.name} />
                </div>
                <div className="hero-product-info">
                  <span className="hero-product-name">{product.name?.slice(0, 22)}</span>
                  <span className="hero-product-price">${product.price}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Floating accent elements */}
          <div className="hero-accent hero-accent-1">
            <FaPercentage />
            <span>Up to 30% Off</span>
          </div>
          <div className="hero-accent hero-accent-2">
            <FaStar />
            <span>Top Rated</span>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="value-props">
        <div className="value-prop">
          <div className="value-prop-icon"><FaTruck /></div>
          <h4>Free Shipping</h4>
          <p>On orders over $50</p>
        </div>
        <div className="value-prop">
          <div className="value-prop-icon"><FaShieldAlt /></div>
          <h4>Secure Payment</h4>
          <p>100% protected</p>
        </div>
        <div className="value-prop">
          <div className="value-prop-icon"><FaUndoAlt /></div>
          <h4>Easy Returns</h4>
          <p>30-day return policy</p>
        </div>
        <div className="value-prop">
          <div className="value-prop-icon"><FaHeadset /></div>
          <h4>24/7 Support</h4>
          <p>Dedicated help</p>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="home-section home-animate" ref={categoryRef}>
        <div className="section-header">
          <div>
            <h2>Shop by Category</h2>
            <p className="section-subtitle">Browse our wide selection of products</p>
          </div>
          <Link to="/products" className="section-link">
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                to={`/products?category=${cat.name}`}
                key={cat.name}
                className="category-card"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="category-icon" style={{ background: cat.bg, color: cat.color }}>
                  <Icon />
                </div>
                <h3>{cat.name}</h3>
                <span className="category-count">{categoryCounts[cat.name] || 0} items</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="home-section home-animate" ref={featuredRef}>
        <div className="section-header">
          <div>
            <h2><FaStar className="section-icon" /> Featured Products</h2>
            <p className="section-subtitle">Handpicked items just for you</p>
          </div>
          <Link to="/products" className="section-link">
            See All <FaArrowRight />
          </Link>
        </div>
        <div className="products-grid">
          {featured.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-badge">Limited Time Offer</span>
          <h2>Get Up To 30% Off</h2>
          <p>On selected electronics and accessories. Don't miss out on these incredible deals!</p>
          <Link to="/products?category=Electronics" className="promo-btn">
            Shop Deals <FaArrowRight />
          </Link>
        </div>
        <div className="promo-decoration">
          <div className="promo-circle promo-circle-1" />
          <div className="promo-circle promo-circle-2" />
          <div className="promo-circle promo-circle-3" />
        </div>
      </section>

      {/* ===== TRENDING NOW ===== */}
      <section className="home-section home-animate" ref={trendingRef}>
        <div className="section-header">
          <div>
            <h2><FaFire className="section-icon trending-icon" /> Trending Now</h2>
            <p className="section-subtitle">See what other shoppers loved</p>
          </div>
          <Link to="/products" className="section-link">
            More Products <FaArrowRight />
          </Link>
        </div>
        <div className="products-grid">
          {trending.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {deals.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div>
              <h2><FaBolt className="section-icon bolt-icon" /> New Arrivals</h2>
              <p className="section-subtitle">Fresh products just added</p>
            </div>
            <Link to="/products" className="section-link">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {deals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
