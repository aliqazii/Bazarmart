import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const getStableDiscount = (product) => {
  if (Number(product?.price || 0) <= 50) return 0;
  const source = String(product?._id || product?.name || "0");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 100000;
  }
  return (hash % 15) + 10;
};

const ProductCard = ({ product }) => {
  const { user, wishlist, toggleWishlistItem } = useAuth();
  const isWished = wishlist.includes(product._id);
  const discount = getStableDiscount(product);
  const originalPrice = discount ? (product.price / (1 - discount / 100)).toFixed(2) : null;

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => item._id === product._id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Added to cart");
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    const result = await toggleWishlistItem(product._id);
    if (result) toast.success(result.message);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={product.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"}
          alt={product.name}
          loading="lazy"
        />
        {discount > 0 && <span className="product-card-badge">-{discount}%</span>}
        {product.stock < 1 && <span className="product-card-badge out-badge">Sold Out</span>}
        <div className="product-card-actions">
          <button
            className={`product-card-wish-btn ${isWished ? "wished" : ""}`}
            onClick={handleWishlist}
            title={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWished ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button
            className="product-card-cart-btn"
            onClick={addToCart}
            disabled={product.stock < 1}
            title="Add to cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <span className="product-card-category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-card-rating">
          <FaStar className="star-icon" />
          <span className="rating-value">{product.ratings.toFixed(1)}</span>
          <span className="rating-count">({product.numOfReviews})</span>
        </div>
        <div className="product-card-pricing">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          {originalPrice && <span className="product-card-original">${originalPrice}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
