import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, cartBounce } from "../motionVariants";

const MotionLink = motion(Link);

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
  const shouldReduceMotion = useReducedMotion();
  const isWished = wishlist.includes(product._id);
  const discount = getStableDiscount(product);
  const originalPrice = discount ? (product.price / (1 - discount / 100)).toFixed(2) : null;

  const ratingValue = Math.max(0, Math.min(5, Number(product?.ratings || 0)));
  const reviewCount = Number(product?.numOfReviews || 0);
  const roundedStars = Math.round(ratingValue * 2) / 2;
  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars - fullStars === 0.5;

  const topReviews = Array.isArray(product?.topReviews) ? product.topReviews : [];

  const imageUrl = product.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image";

  const [cartAnim, setCartAnim] = useState(false);
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
    setCartAnim(true);
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


  // Only use fadeInUp for entry animation; hover is handled by CSS for perf
  const cardMotionProps = shouldReduceMotion ? {} : { ...fadeInUp };

  return (
    <MotionLink
      to={`/product/${product._id}`}
      className="product-card product-card--glass"
      {...cardMotionProps}
    >
      <div className="product-card-image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width="400"
          height="220"
          className="product-card-img-element"
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
          <motion.button
            className="product-card-cart-btn"
            onClick={addToCart}
            disabled={product.stock < 1}
            title="Add to cart"
            animate={cartAnim ? "animate" : false}
            variants={cartBounce}
            onAnimationComplete={() => setCartAnim(false)}
          >
            <FaShoppingCart />
          </motion.button>
        </div>
      </div>
      <div className="product-card-info">
        <span className="product-card-category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-card-rating">
          <div className="stars-display stars-mini" aria-label={`Rating ${ratingValue.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((s) => {
              if (s <= fullStars) return <FaStar key={s} className="star-filled" />;
              if (s === fullStars + 1 && hasHalfStar) return <FaStarHalfAlt key={s} className="star-filled" />;
              return <FaRegStar key={s} className="star-empty" />;
            })}
          </div>
          <span className="rating-value">{ratingValue.toFixed(1)}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>
        <div className="product-card-pricing">
          <span className="product-card-price">${Number(product.price || 0).toFixed(2)}</span>
          {originalPrice && <span className="product-card-original">${originalPrice}</span>}
        </div>
      </div>
    </MotionLink>
  );
};

export default ProductCard;
