import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const boot = async () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length > 0) {
        setCartItems(cart);
        return;
      }

      try {
        const { data } = await axios.get("/api/v1/innovation/checkout/recovery");
        if (data.recovery?.cartItems?.length > 0) {
          setCartItems(data.recovery.cartItems);
          localStorage.setItem("cart", JSON.stringify(data.recovery.cartItems));
        }
      } catch {
        // ignore recovery load failures
      }
    };

    boot();
  }, []);

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    axios.post("/api/v1/innovation/checkout/recovery", {
      cartItems: updatedCart,
      lastStep: "cart",
      abandoned: false,
    }).catch(() => {});
  };

  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find((i) => (i.cartKey || i._id) === cartKey);
    if (item && item.stock && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} available in stock`);
      return;
    }
    const updated = cartItems.map((item) =>
      (item.cartKey || item._id) === cartKey ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updated);
  };

  const removeItem = (cartKey) => {
    const updated = cartItems.filter((item) => (item.cartKey || item._id) !== cartKey);
    updateCart(updated);
    toast.success("Item removed from cart");
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/products">
          <button>Continue Shopping</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.cartKey || item._id} className="cart-item">
              <img src={item.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"} alt={item.name} />
              <div className="cart-item-info">
                <Link to={`/product/${item._id}`}>{item.name}</Link>
                {item.selectedColor && (
                  <span className="cart-item-size">Color: {item.selectedColor}</span>
                )}
                {item.selectedSize && (
                  <span className="cart-item-size">Size: {item.selectedSize}</span>
                )}
                <p className="cart-item-price">${item.price}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.cartKey || item._id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartKey || item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="cart-item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                className="remove-btn"
                onClick={() => removeItem(item.cartKey || item._id)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>
              Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={() => navigate("/shipping")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
