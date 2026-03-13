import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const shipping = JSON.parse(localStorage.getItem("shippingInfo") || "{}");

      if (cart.length > 0 && shipping.address) {
        setCartItems(cart);
        setShippingInfo(shipping);
        setBootstrapped(true);
        return;
      }

      try {
        const { data } = await axios.get("/api/v1/innovation/checkout/recovery");
        const recovery = data.recovery;
        if (recovery?.cartItems?.length > 0) {
          setCartItems(recovery.cartItems);
        }
        if (recovery?.shippingInfo?.address) {
          setShippingInfo(recovery.shippingInfo);
        }
      } catch {
        // ignore recovery errors
      } finally {
        setBootstrapped(true);
      }
    };

    boot();
  }, [navigate]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (cartItems.length === 0 || !shippingInfo.address) {
      navigate("/cart");
    }
  }, [cartItems, shippingInfo, navigate, bootstrapped]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const discount = couponApplied ? (subtotal * couponApplied.discount) / 100 : 0;
  const totalPrice = subtotal + shippingPrice + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await axios.post("/api/v1/coupons/validate", {
        code: couponCode,
        orderAmount: subtotal,
      });
      setCouponApplied(data.coupon);
      toast.success(`Coupon applied! ${data.coupon.discount}% off`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
  };

  const handleProceedToPayment = () => {
    const data = {
      subtotal,
      shippingPrice,
      tax,
      totalPrice,
      couponCode: couponApplied ? couponCode : "",
      discountAmount: discount,
    };
    sessionStorage.setItem("orderInfo", JSON.stringify(data));
    axios.post("/api/v1/innovation/checkout/recovery", {
      cartItems,
      shippingInfo,
      couponCode: couponApplied ? couponCode : "",
      lastStep: "confirm",
      abandoned: false,
    }).catch(() => {});
    navigate("/payment");
  };

  return (
    <div className="confirm-order-page">
      <h1>Confirm Order</h1>

      <div className="confirm-order-content">
        <div className="confirm-left">
          <div className="shipping-summary">
            <h2>Shipping Info</h2>
            <p>
              <strong>Address:</strong> {shippingInfo.address}, {shippingInfo.city},{" "}
              {shippingInfo.state} {shippingInfo.pinCode}
            </p>
            <p>
              <strong>Phone:</strong> {shippingInfo.phoneNo}
            </p>
          </div>

          <div className="cart-summary-section">
            <h2>Order Items</h2>
            {cartItems.map((item) => (
              <div key={item.cartKey || item._id} className="confirm-item">
                <img
                  src={item.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"}
                  alt={item.name}
                />
                <span>
                  {item.name}
                  {item.selectedColor && <small className="confirm-item-size"> (Color: {item.selectedColor})</small>}
                  {item.selectedSize && <small className="confirm-item-size"> (Size: {item.selectedSize})</small>}
                </span>
                <span>
                  {item.quantity} x ${item.price} = $
                  {(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="confirm-right">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>${shippingPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {couponApplied && (
            <div className="summary-row discount">
              <span>Discount ({couponApplied.discount}%):</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            {!couponApplied ? (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={handleApplyCoupon} disabled={couponLoading}>
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="coupon-applied">
                <span>🎉 {couponCode} — {couponApplied.discount}% off</span>
                <button onClick={handleRemoveCoupon}>Remove</button>
              </div>
            )}
          </div>

          <button onClick={handleProceedToPayment}>Proceed to Payment</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
