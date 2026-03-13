import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import { FaHeart } from "react-icons/fa";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get("/api/v1/wishlist");
        setProducts(data.products);
      } catch {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="wishlist-page">
      <h1><FaHeart style={{ color: "#e74c3c" }} /> My Wishlist</h1>

      {products.length === 0 ? (
        <div className="empty-cart">
          <h2>Your wishlist is empty</h2>
          <Link to="/products">
            <button>Browse Products</button>
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
