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
import { motion } from "framer-motion";
import { fadeInUp, slideInUp, staggerGrid, glassReveal } from "../motionVariants";


const categories = [
  { name: "Electronics", icon: FaLaptop, color: "#60a5fa", bg: "rgba(16, 185, 129,0.15)" },
  { name: "Clothing", icon: FaTshirt, color: "#a78bfa", bg: "rgba(16, 185, 129,0.15)" },
  { name: "Books", icon: FaBook, color: "#34d399", bg: "rgba(16,185,129,0.15)" },
  { name: "Shoes", icon: FaShoePrints, color: "#fbbf24", bg: "rgba(245,158,11,0.15)" },
  { name: "Accessories", icon: FaGem, color: "#f472b6", bg: "rgba(236,72,153,0.15)" },
  { name: "Home", icon: FaCouch, color: "var(--brand-accent-hover)", bg: "rgba(16, 185, 129,0.15)" },
  { name: "Sports", icon: FaFootballBall, color: "#2dd4bf", bg: "rgba(20,184,166,0.15)" },
];

const pickTopRated = (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return null;
  return [...products]
    .sort((a, b) => (Number(b?.ratings || 0) - Number(a?.ratings || 0)) || (Number(b?.numOfReviews || 0) - Number(a?.numOfReviews || 0)))
    .find(Boolean) || null;
};

const fillUniqueByCategory = (pools = [], desiredCount = 8) => {
  const picked = [];
  const usedIds = new Set();
  const usedCategories = new Set();

  // Pass 1: unique categories
  for (const pool of pools) {
    for (const p of pool || []) {
      if (!p?._id) continue;
      if (usedIds.has(p._id)) continue;
      const cat = String(p.category || "").trim();
      if (!cat || usedCategories.has(cat)) continue;
      picked.push(p);
      usedIds.add(p._id);
      usedCategories.add(cat);
      if (picked.length >= desiredCount) return picked;
      break;
    }
  }

  // Pass 2: fill remaining (any category)
  for (const pool of pools) {
    for (const p of pool || []) {
      if (!p?._id) continue;
      if (usedIds.has(p._id)) continue;
      picked.push(p);
      usedIds.add(p._id);
      if (picked.length >= desiredCount) return picked;
    }
  }

  return picked;
};

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
  const [errorMsg, setErrorMsg] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const featuredRef = useRef(null);
  const trendingRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMsg("");
        // Sample products across categories so Home doesn't end up showing only one category.
        const categoryResponses = await Promise.all(
          categories.map((cat) =>
            axios
              .get(`/api/v1/products?category=${encodeURIComponent(cat.name)}&page=1&includeTopReviews=1`)
              .catch(() => null)
          )
        );

        const categoryPools = categoryResponses
          .map((r) => r?.data?.products || [])
          .filter(Boolean);

        const counts = {};
        categories.forEach((cat, idx) => {
          counts[cat.name] = categoryResponses[idx]?.data?.productsCount || 0;
        });
        setCategoryCounts(counts);

        // Featured: up to 2 items per category, then fill.
        const featuredPool = categoryPools.map((pool) => (pool || []).slice(0, 2));
        let featuredPicks = fillUniqueByCategory(featuredPool, 8);

        // Trending: top-rated per category (if available), then fill.
        const trendingSeed = categoryPools
          .map((pool) => {
            const top = pickTopRated(pool);
            return top ? [top] : [];
          });
        let trendingPicks = fillUniqueByCategory(trendingSeed, 4);

        // New arrivals: newest per category, then fill.
        const arrivalsSeed = categoryPools.map((pool) => (pool?.[0] ? [pool[0]] : []));
        let arrivalPicks = fillUniqueByCategory(arrivalsSeed, 4);

        // If most categories are empty, fall back to generic products.
        if (featuredPicks.length < 8 || trendingPicks.length < 4 || arrivalPicks.length < 4) {
          const { data: fallback } = await axios.get("/api/v1/products?page=1&includeTopReviews=1");
          const fallbackPool = Array.isArray(fallback?.products) ? fallback.products : [];
          featuredPicks = [...featuredPicks, ...fillUniqueByCategory([fallbackPool], 8 - featuredPicks.length)];
          trendingPicks = [...trendingPicks, ...fillUniqueByCategory([fallbackPool], 4 - trendingPicks.length)];
          arrivalPicks = [...arrivalPicks, ...fillUniqueByCategory([fallbackPool], 4 - arrivalPicks.length)];
        }

        setFeatured(featuredPicks);
        setTrending(trendingPicks);
        setDeals(arrivalPicks);

        // Hero: showcase from the mixed featured pool.
        setHeroProducts(featuredPicks.slice(0, 4));
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.code === "ERR_NETWORK"
            ? "Cannot reach API server. Start the backend on http://localhost:5000 (and seed the DB)."
            : "Failed to fetch products");
        toast.error(message);
        setErrorMsg(message);
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
    <motion.div className="home" initial="initial" animate="animate">
      {errorMsg && <p className="no-products">{errorMsg}</p>}
      {/* ===== HERO SECTION ===== */}
      <motion.section className="hero" variants={slideInUp}>
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
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    loading={i < 2 ? "eager" : "lazy"}
                    fetchPriority={i < 2 ? "high" : "low"}
                    decoding="async"
                    width="200"
                    height="200"
                  />
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
      </motion.section>

      {/* ===== VALUE PROPS ===== */}
      <motion.section className="value-props" variants={staggerGrid} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="value-prop" variants={glassReveal}>
          <div className="value-prop-icon"><FaTruck /></div>
          <h4>Free Shipping</h4>
          <p>On orders over $50</p>
        </motion.div>
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
      </motion.section>

      {/* ===== SHOP BY CATEGORY ===== */}
      {/* Uses IntersectionObserver + CSS for perf instead of Framer stagger */}
      <section className="home-section" ref={categoryRef}>
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
      {/* Plain section — IntersectionObserver adds home-visible class for CSS reveal */}
      <section className="home-section" ref={featuredRef}>
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
      <motion.section className="promo-banner" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
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
      </motion.section>

      {/* ===== TRENDING NOW ===== */}
      <section className="home-section" ref={trendingRef}>
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
    </motion.div>
  );
};

export default Home;
