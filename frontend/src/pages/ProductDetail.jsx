import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaStar, FaRegStar, FaBell, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import useScrollReveal from "../hooks/useScrollReveal";
import useDocumentMeta from "../hooks/useDocumentMeta";

const DEFAULT_SHOE_SIZES = ["39", "40", "41", "42", "43", "44"];

const inferColorName = (name = "") => {
  const normalized = String(name).toLowerCase();
  const colorMap = [
    ["black", "Black"],
    ["white", "White"],
    ["blue", "Blue"],
    ["red", "Red"],
    ["green", "Green"],
    ["pink", "Pink"],
    ["brown", "Brown"],
    ["grey", "Grey"],
    ["gray", "Grey"],
    ["silver", "Silver"],
    ["gold", "Gold"],
    ["golden", "Gold"],
    ["beige", "Beige"],
    ["cream", "Cream"],
  ];

  const matched = colorMap.find(([token]) => normalized.includes(token));
  return matched ? matched[1] : "Default";
};

const inferColorSwatch = (colorName = "Default") => {
  const swatches = {
    Black: "#111111",
    White: "#f5f5f5",
    Blue: "#2563eb",
    Red: "#dc2626",
    Green: "#059669",
    Pink: "#ec4899",
    Brown: "#8b5e3c",
    Grey: "#9ca3af",
    Silver: "#c0c0c0",
    Gold: "#d4a017",
    Beige: "#d6b48a",
    Cream: "#f3e7c9",
    Default: "#374151",
  };

  return swatches[colorName] || swatches.Default;
};

const resolveShoeColors = (product) => {
  if (product?.colorOptions?.length > 0) return product.colorOptions;

  const variantColors = (product?.variants || []).reduce((acc, variant) => {
    const colorName = String(variant.color || "").trim();
    if (!colorName) return acc;
    const existing = acc.find((option) => option.name === colorName);
    if (existing) {
      if (variant.image && !existing.images.some((image) => image.url === variant.image)) {
        existing.images.push({ url: variant.image });
      }
      return acc;
    }
    acc.push({
      name: colorName,
      swatch: inferColorSwatch(colorName),
      images: variant.image ? [{ url: variant.image }] : product?.images || [],
    });
    return acc;
  }, []);

  if (variantColors.length > 0) return variantColors;

  if (product?.category === "Shoes") {
    const fallbackColor = inferColorName(product?.name);
    return [
      {
        name: fallbackColor,
        swatch: inferColorSwatch(fallbackColor),
        images: product?.images?.length > 0 ? product.images : [{ url: "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image" }],
      },
    ];
  }

  return [];
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [stockAlertActive, setStockAlertActive] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const similarRef = useScrollReveal();
  const imageRef = useRef(null);

  useDocumentMeta({
    title: product ? `${product.name} | Bazarmart` : "Product | Bazarmart",
    description: product?.description || "Explore premium products at Bazarmart.",
  });

  const handleImageMove = (e) => {
    const img = imageRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    img.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
  };

  const handleImageLeave = () => {
    if (imageRef.current) imageRef.current.style.transform = "";
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setQuantity(1);
        setSelectedSize("");
        setSelectedColor("");
        setSelectedImage(0);
        setStockAlertActive(false);
        const { data } = await axios.get(`/api/v1/products/${id}`);
        setProduct(data.product);
        setSelectedColor(resolveShoeColors(data.product)[0]?.name || "");

        // Track recently viewed
        const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const updated = [id, ...viewed.filter((v) => v !== id)].slice(0, 10);
        localStorage.setItem("recentlyViewed", JSON.stringify(updated));

        // Fetch similar products
        const { data: similar } = await axios.get(
          `/api/v1/products?category=${encodeURIComponent(data.product.category)}`
        );
        setSimilarProducts(
          similar.products.filter((p) => p._id !== data.product._id).slice(0, 4)
        );

        // Fetch reviews
        try {
          const { data: revData } = await axios.get(`/api/v1/reviews/product/${id}`);
          setReviews(revData.reviews || []);
        } catch { /* no reviews */ }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check stock alert subscription separately
  useEffect(() => {
    if (user && id) {
      axios.get(`/api/v1/stock-alerts/check/${id}`)
        .then(({ data }) => setStockAlertActive(data.active))
        .catch(() => setStockAlertActive(false));
    }
  }, [id, user]);

  // Load recently viewed products
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const others = viewed.filter((v) => v !== id).slice(0, 4);
      if (others.length === 0) return;
      try {
        const results = await Promise.all(
          others.map((pid) => axios.get(`/api/v1/products/${pid}`).then((r) => r.data.product).catch(() => null))
        );
        setRecentlyViewed(results.filter(Boolean));
      } catch { /* ignore */ }
    };
    loadRecentlyViewed();
  }, [id]);

  const isShoe = product?.category === "Shoes";
  const isClothing = product?.category === "Clothing" && product?.sizes?.length > 0;
  const availableSizes = isShoe
    ? product?.sizes?.length > 0
      ? product.sizes
      : DEFAULT_SHOE_SIZES
    : product?.sizes || [];
  const availableColorOptions = resolveShoeColors(product);

  const selectedColorOption =
    availableColorOptions.find((option) => option.name === selectedColor) || availableColorOptions[0] || null;

  const activeImages =
    selectedColorOption?.images?.length > 0
      ? selectedColorOption.images
      : product?.images?.length > 0
      ? product.images
      : [{ url: "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image" }];

  const addToCart = () => {
    if ((isClothing || isShoe) && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (isShoe && availableColorOptions.length > 0 && !selectedColorOption) {
      toast.error("Please select a color");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartKey = isShoe
      ? `${product._id}_${selectedColorOption?.name || "default"}_${selectedSize}`
      : isClothing
      ? `${product._id}_${selectedSize}`
      : product._id;
    const existingIndex = cart.findIndex((item) => item.cartKey === cartKey);

    const cartItem = {
      ...product,
      quantity,
      selectedSize: selectedSize || "",
      selectedColor: selectedColorOption?.name || "",
      images: activeImages,
      cartKey,
    };

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Added to cart");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setReviewLoading(true);
    try {
      await axios.post("/api/v1/reviews", {
        product: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      // Refresh reviews & product
      const { data: revData } = await axios.get(`/api/v1/reviews/product/${id}`);
      setReviews(revData.reviews || []);
      const { data: prodData } = await axios.get(`/api/v1/products/${id}`);
      setProduct(prodData.product);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStockAlert = async () => {
    try {
      await axios.post("/api/v1/stock-alerts/subscribe", { product: id });
      setStockAlertActive(true);
      toast.success("You'll be notified when this item is back in stock!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to subscribe");
    }
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  const images = activeImages;

  return (
    <div className="product-detail">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail-image">
        <div className="image-gallery">
          {images.length > 1 && (
            <button className="gallery-nav prev" onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}>
              <FaChevronLeft />
            </button>
          )}
          <img
            ref={imageRef}
            src={images[selectedImage]?.url}
            alt={product.name}
            onMouseMove={handleImageMove}
            onMouseLeave={handleImageLeave}
          />
          {images.length > 1 && (
            <button className="gallery-nav next" onClick={() => setSelectedImage((i) => (i + 1) % images.length)}>
              <FaChevronRight />
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="image-thumbnails">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`${product.name} ${i + 1}`}
                className={selectedImage === i ? "active" : ""}
                onClick={() => setSelectedImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="product-detail-info">
        <h1>{product.name}</h1>
        <p className="product-id">Product #{product._id}</p>

        <div className="product-detail-rating">
          <div className="stars-display">
            {[1, 2, 3, 4, 5].map((s) =>
              s <= Math.round(product.ratings) ? <FaStar key={s} className="star-filled" /> : <FaRegStar key={s} className="star-empty" />
            )}
          </div>
          <span>{product.ratings}/5 ({product.numOfReviews} Reviews)</span>
        </div>

        {product.gender && (
          <span className={`gender-badge gender-${product.gender.toLowerCase()}`}>
            {product.gender}
          </span>
        )}

        <h2 className="product-detail-price">${product.price}</h2>

        {isShoe && availableColorOptions.length > 0 && (
          <div className="color-selector">
            <h3>Select Color</h3>
            <div className="color-options">
              {availableColorOptions.map((option) => (
                <button
                  key={option.name}
                  className={`color-btn ${selectedColorOption?.name === option.name ? "active" : ""}`}
                  onClick={() => {
                    setSelectedColor(option.name);
                    setSelectedImage(0);
                  }}
                >
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: option.swatch || option.name.toLowerCase() }}
                  />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(isClothing || isShoe) && (
          <div className="size-selector">
            <h3>{isShoe ? "Select Shoe Size" : "Select Size"}</h3>
            <div className="size-options">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="product-detail-cart">
          <div className="quantity-controls">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>
          <button onClick={addToCart} disabled={product.stock < 1} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>

        <p className={`stock-status ${product.stock < 1 ? "out" : "in"}`}>
          Status: {product.stock < 1 ? "Out of Stock" : "In Stock"}
        </p>

        {product.stock < 1 && user && !stockAlertActive && (
          <button className="stock-alert-btn" onClick={handleStockAlert}>
            <FaBell /> Notify me when available
          </button>
        )}
        {stockAlertActive && (
          <p className="stock-alert-active"><FaBell /> You'll be notified when this item is back in stock</p>
        )}

        <div className="product-detail-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews ({reviews.length})</h2>

        {user && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="review-rating-input">
              <label>Rating:</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setReviewRating(s)} className={s <= reviewRating ? "star-active" : ""}>
                    {s <= reviewRating ? <FaStar /> : <FaRegStar />}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
            />
            <button type="submit" disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <strong>{r.user?.name || "User"}</strong>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((s) =>
                      s <= r.rating ? <FaStar key={s} className="star-filled" /> : <FaRegStar key={s} className="star-empty" />
                    )}
                  </div>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="similar-products scroll-reveal" ref={similarRef}>
          <h2>Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="recently-viewed-section">
          <h2>Recently Viewed</h2>
          <div className="similar-products-grid">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
