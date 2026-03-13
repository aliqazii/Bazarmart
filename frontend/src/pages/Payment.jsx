import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const CARD_REGEX = /^4[0-9]{15}$/;
const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
const CVV_REGEX = /^[0-9]{3}$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,}$/;
const WALLET_ACCOUNT_REGEX = /^03[0-9]{9}$/;
const WALLET_PIN_REGEX = /^[0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [receiptEmail, setReceiptEmail] = useState("");

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [wallet, setWallet] = useState({
    accountNumber: "",
    accountName: "",
    pin: "",
  });

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo") || "{}");

  useEffect(() => {
    if (user?.email && !receiptEmail) {
      setReceiptEmail(user.email);
    }
  }, [user, receiptEmail]);

  const methodLabel =
    method === "cod"
      ? "Cash on Delivery"
      : method === "visa"
      ? "Visa Card"
      : method === "jazzcash"
      ? "JazzCash"
      : method === "easypaisa"
      ? "EasyPaisa"
      : "";

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "number") {
      setCard((prev) => ({ ...prev, number: formatCardNumber(value) }));
    } else if (name === "expiry") {
      setCard((prev) => ({ ...prev, expiry: formatExpiry(value) }));
    } else if (name === "cvv") {
      setCard((prev) => ({ ...prev, cvv: value.replace(/\D/g, "").slice(0, 3) }));
    } else {
      setCard((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWalletChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "accountNumber") {
      setWallet((prev) => ({
        ...prev,
        accountNumber: value.replace(/\D/g, "").slice(0, 11),
      }));
      return;
    }

    if (name === "pin") {
      setWallet((prev) => ({ ...prev, pin: value.replace(/\D/g, "").slice(0, 4) }));
      return;
    }

    setWallet((prev) => ({ ...prev, [name]: value }));
  };

  const validateCard = () => {
    const errs = {};
    const rawNumber = card.number.replace(/\s/g, "");

    if (!CARD_REGEX.test(rawNumber)) {
      errs.number = "Enter a valid 16-digit Visa card number (starts with 4)";
    }
    if (!NAME_REGEX.test(card.name.trim())) {
      errs.name = "Enter the cardholder name";
    }
    if (!EXPIRY_REGEX.test(card.expiry)) {
      errs.expiry = "Enter valid expiry in MM/YY format";
    } else {
      const [, mm, yy] = card.expiry.match(EXPIRY_REGEX);
      const expDate = new Date(2000 + Number(yy), Number(mm));
      if (expDate < new Date()) {
        errs.expiry = "Card has expired";
      }
    }
    if (!CVV_REGEX.test(card.cvv)) {
      errs.cvv = "Enter a valid 3-digit CVV";
    }
    return errs;
  };

  const validateWallet = () => {
    const errs = {};

    if (!WALLET_ACCOUNT_REGEX.test(wallet.accountNumber)) {
      errs.accountNumber = "Enter a valid 11-digit account/mobile number (03XXXXXXXXX)";
    }

    if (!NAME_REGEX.test(wallet.accountName.trim())) {
      errs.accountName = "Enter the account holder name";
    }

    if (!WALLET_PIN_REGEX.test(wallet.pin)) {
      errs.pin = "Enter your 4-digit wallet PIN";
    }

    return errs;
  };

  const handleProceed = () => {
    if (!EMAIL_REGEX.test(receiptEmail.trim())) {
      setErrors((prev) => ({ ...prev, receiptEmail: "Enter a valid email address" }));
      toast.error("Please enter a valid receipt email");
      return;
    }

    if (method === "visa") {
      const errs = validateCard();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        toast.error(Object.values(errs)[0]);
        return;
      }
    } else if (method === "jazzcash" || method === "easypaisa") {
      const errs = validateWallet();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        toast.error(Object.values(errs)[0]);
        return;
      }
    }
    setShowConfirm(true);
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setErrors((prev) => ({ ...prev, receiptEmail: "" }));
  };

  const placeOrder = async (selectedMethod = method) => {
    const resolvedMethod = typeof selectedMethod === "string" ? selectedMethod : method;
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const shippingInfo = JSON.parse(localStorage.getItem("shippingInfo") || "{}");

      if (!orderInfo.totalPrice || cart.length === 0 || !shippingInfo.address) {
        toast.error("Order data missing. Please start from the cart.");
        navigate("/cart");
        return;
      }

      let paymentInfo;

      if (resolvedMethod === "visa") {
        const { data } = await axios.post("/api/v1/payment/process", {
          amount: Math.round(Number(orderInfo.totalPrice || 0) * 100),
        });

        paymentInfo = {
          id: data.client_secret || `VISA_${Date.now()}`,
          status: data.mode === "mock" ? "Paid (Mock)" : "Paid",
          method: "visa",
        };
      } else {
        const { data } = await axios.post("/api/v1/payment/process/local", {
          method: resolvedMethod,
          amount: Number(orderInfo.totalPrice || 0),
          accountNumber: wallet.accountNumber,
          accountName: wallet.accountName,
        });

        paymentInfo = {
          id: data?.payment?.transactionId || `${resolvedMethod.toUpperCase()}_${Date.now()}`,
          status: data?.payment?.status || "Pending Verification",
          method: resolvedMethod,
        };
      }

      const orderData = {
        shippingInfo,
        contactEmail: receiptEmail.trim(),
        orderItems: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0]?.url || "",
          size: item.selectedSize || "",
          color: item.selectedColor || "",
          product: item._id,
        })),
        paymentInfo,
        itemsPrice: orderInfo.subtotal,
        taxPrice: orderInfo.tax,
        shippingPrice: orderInfo.shippingPrice,
        totalPrice: orderInfo.totalPrice,
        couponCode: orderInfo.couponCode || "",
        discountAmount: orderInfo.discountAmount || 0,
      };

      await axios.post("/api/v1/orders/new", orderData);

      localStorage.removeItem("cart");
      sessionStorage.removeItem("orderInfo");

      toast.success(
        resolvedMethod === "cod"
          ? "Order placed! Pay on delivery."
          : resolvedMethod === "visa"
          ? "Payment successful! Order placed."
          : `Payment completed with ${resolvedMethod === "jazzcash" ? "JazzCash" : "EasyPaisa"}.`
      );
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="payment-page">
      <h1>Payment</h1>

      {/* Step 1: Choose method */}
      {!method && (
        <div className="payment-method-panel">
          <div className="payment-method-head">
            <h2>Select Payment Method</h2>
            <p>Amount due: ${Number(orderInfo.totalPrice || 0).toFixed(2)}</p>
          </div>

          <div className="payment-method-grid">
            <button className="method-btn cod-btn" onClick={() => handleMethodSelect("cod")}>
              <span className="method-icon">💵</span>
              <span className="method-text">
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives</small>
              </span>
            </button>

            <button className="method-btn visa-btn" onClick={() => handleMethodSelect("visa")}>
              <span className="method-icon">💳</span>
              <span className="method-text">
                <strong>Visa / Debit Card</strong>
                <small>Pay securely with your Visa card</small>
              </span>
            </button>

            <button
              className="method-btn"
              onClick={() => handleMethodSelect("jazzcash")}
            >
              <span className="method-icon">📱</span>
              <span className="method-text">
                <strong>JazzCash</strong>
                <small>Pay via JazzCash account details</small>
              </span>
            </button>

            <button
              className="method-btn"
              onClick={() => handleMethodSelect("easypaisa")}
            >
              <span className="method-icon">📲</span>
              <span className="method-text">
                <strong>EasyPaisa</strong>
                <small>Pay via EasyPaisa account details</small>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2a: COD confirmation */}
      {method === "cod" && !showConfirm && (
        <div className="payment-form">
          <div className="payment-method-header">
            <h2>💵 Cash on Delivery</h2>
            <button className="change-method-btn" onClick={() => setMethod("")}>Change</button>
          </div>
          <div className="form-group">
            <label>Email for Order Details</label>
            <input
              type="email"
              name="receiptEmail"
              placeholder="you@example.com"
              value={receiptEmail}
              onChange={(e) => {
                setReceiptEmail(e.target.value);
                setErrors((prev) => ({ ...prev, receiptEmail: "" }));
              }}
              className={errors.receiptEmail ? "input-error" : ""}
            />
            {errors.receiptEmail && <span className="field-error">{errors.receiptEmail}</span>}
          </div>
          <div className="cod-info">
            <p>You will pay <strong>${orderInfo.totalPrice?.toFixed(2)}</strong> in cash when your order is delivered.</p>
            <ul>
              <li>Keep exact change ready</li>
              <li>Delivery person will collect the payment</li>
              <li>You'll receive an order confirmation via email</li>
            </ul>
          </div>
          <button className="pay-btn" onClick={handleProceed}>
            Place Order — ${orderInfo.totalPrice?.toFixed(2)}
          </button>
        </div>
      )}

      {/* Step 2b: Visa card form */}
      {method === "visa" && !showConfirm && (
        <div className="payment-form">
          <div className="payment-method-header">
            <h2>💳 Visa Card Payment</h2>
            <button className="change-method-btn" onClick={() => setMethod("")}>Change</button>
          </div>

          <div className="form-group">
            <label>Email for Order Details</label>
            <input
              type="email"
              name="receiptEmail"
              placeholder="you@example.com"
              value={receiptEmail}
              onChange={(e) => {
                setReceiptEmail(e.target.value);
                setErrors((prev) => ({ ...prev, receiptEmail: "" }));
              }}
              className={errors.receiptEmail ? "input-error" : ""}
            />
            {errors.receiptEmail && <span className="field-error">{errors.receiptEmail}</span>}
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              name="number"
              placeholder="4XXX XXXX XXXX XXXX"
              value={card.number}
              onChange={handleCardChange}
              maxLength={19}
              className={errors.number ? "input-error" : ""}
            />
            {errors.number && <span className="field-error">{errors.number}</span>}
            <small className="field-hint">Visa cards start with 4</small>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name on card"
              value={card.name}
              onChange={handleCardChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={handleCardChange}
                maxLength={5}
                className={errors.expiry ? "input-error" : ""}
              />
              {errors.expiry && <span className="field-error">{errors.expiry}</span>}
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                name="cvv"
                placeholder="•••"
                value={card.cvv}
                onChange={handleCardChange}
                maxLength={3}
                className={errors.cvv ? "input-error" : ""}
              />
              {errors.cvv && <span className="field-error">{errors.cvv}</span>}
            </div>
          </div>

          <button className="pay-btn" onClick={handleProceed}>
            Pay ${orderInfo.totalPrice?.toFixed(2)}
          </button>
        </div>
      )}

      {(method === "jazzcash" || method === "easypaisa") && !showConfirm && (
        <div className="payment-form">
          <div className="payment-method-header">
            <h2>{method === "jazzcash" ? "📱 JazzCash Payment" : "📲 EasyPaisa Payment"}</h2>
            <button className="change-method-btn" onClick={() => setMethod("")}>Change</button>
          </div>

          <div className="form-group">
            <label>Email for Order Details</label>
            <input
              type="email"
              name="receiptEmail"
              placeholder="you@example.com"
              value={receiptEmail}
              onChange={(e) => {
                setReceiptEmail(e.target.value);
                setErrors((prev) => ({ ...prev, receiptEmail: "" }));
              }}
              className={errors.receiptEmail ? "input-error" : ""}
            />
            {errors.receiptEmail && <span className="field-error">{errors.receiptEmail}</span>}
          </div>

          <div className="cod-info wallet-info">
            <p>
              Enter your {method === "jazzcash" ? "JazzCash" : "EasyPaisa"} account details to continue.
            </p>
            <ul>
              <li>Account number should be in format 03XXXXXXXXX</li>
              <li>Details are used only for payment verification</li>
            </ul>
          </div>

          <div className="form-group">
            <label>Account / Mobile Number</label>
            <input
              type="text"
              name="accountNumber"
              placeholder="03XXXXXXXXX"
              value={wallet.accountNumber}
              onChange={handleWalletChange}
              maxLength={11}
              className={errors.accountNumber ? "input-error" : ""}
            />
            {errors.accountNumber && <span className="field-error">{errors.accountNumber}</span>}
          </div>

          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              name="accountName"
              placeholder="Name on wallet account"
              value={wallet.accountName}
              onChange={handleWalletChange}
              className={errors.accountName ? "input-error" : ""}
            />
            {errors.accountName && <span className="field-error">{errors.accountName}</span>}
          </div>

          <div className="form-group">
            <label>Wallet PIN</label>
            <input
              type="password"
              name="pin"
              placeholder="4-digit PIN"
              value={wallet.pin}
              onChange={handleWalletChange}
              maxLength={4}
              className={errors.pin ? "input-error" : ""}
            />
            {errors.pin && <span className="field-error">{errors.pin}</span>}
          </div>

          <button className="pay-btn" onClick={handleProceed}>
            Continue - ${orderInfo.totalPrice?.toFixed(2)}
          </button>
        </div>
      )}

      {/* Step 3: Confirmation modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h2>Confirm Payment</h2>
            <div className="confirm-modal-details">
              <p>
                <strong>Method:</strong>{" "}
                {methodLabel}
              </p>
              {method === "visa" && (
                <p>
                  <strong>Card:</strong> •••• •••• ••••{" "}
                  {card.number.replace(/\s/g, "").slice(-4)}
                </p>
              )}
              {(method === "jazzcash" || method === "easypaisa") && (
                <p>
                  <strong>Account:</strong> •••••••{wallet.accountNumber.slice(-4)}
                </p>
              )}
              <p>
                <strong>Amount:</strong> ${orderInfo.totalPrice?.toFixed(2)}
              </p>
              <p>
                <strong>Email:</strong> {receiptEmail}
              </p>
            </div>
            <p className="confirm-question">
              Are you sure you want to{" "}
              {method === "cod" ? "place this order?" : `complete ${methodLabel} payment?`}
            </p>
            <div className="confirm-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => placeOrder()}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
