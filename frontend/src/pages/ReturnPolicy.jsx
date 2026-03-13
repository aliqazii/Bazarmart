import { Link } from "react-router-dom";
import { FaUndoAlt, FaCheckCircle, FaTimesCircle, FaExchangeAlt } from "react-icons/fa";

const ReturnPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <FaUndoAlt className="policy-hero-icon" />
        <h1>Return Policy</h1>
        <p>Hassle-free returns within 30 days of purchase.</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <div className="policy-section-icon"><FaUndoAlt /></div>
          <h2>30-Day Return Window</h2>
          <p>
            We offer a <strong>30-day return policy</strong> from the date of delivery. If you're not
            completely satisfied with your purchase, you can return it for a refund or exchange.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaCheckCircle /></div>
          <h2>Eligible for Return</h2>
          <ul className="policy-list">
            <li>Items must be unused and in original condition</li>
            <li>Items must be in their original packaging</li>
            <li>Proof of purchase (order number or receipt) is required</li>
            <li>Electronics must include all original accessories</li>
            <li>Clothing must have all tags attached</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaTimesCircle /></div>
          <h2>Non-Returnable Items</h2>
          <ul className="policy-list">
            <li>Used or damaged items (not due to shipping)</li>
            <li>Personal care products (fragrances, beauty, skincare)</li>
            <li>Undergarments and swimwear</li>
            <li>Gift cards and downloadable products</li>
            <li>Items marked as "Final Sale"</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaExchangeAlt /></div>
          <h2>How to Return</h2>
          <ol className="policy-steps">
            <li>
              <strong>Initiate a Return:</strong> Go to your{" "}
              <Link to="/orders">My Orders</Link> page and select the order you wish to return, or{" "}
              <Link to="/contact">contact us</Link>.
            </li>
            <li>
              <strong>Pack the Item:</strong> Place the item in its original packaging. Include all accessories and tags.
            </li>
            <li>
              <strong>Ship It Back:</strong> Use the prepaid return label we provide. Drop the package at your nearest courier.
            </li>
            <li>
              <strong>Get a Refund:</strong> Once we receive and inspect the item, your refund will be processed within 5–7 business days.
            </li>
          </ol>
        </section>

        <section className="policy-section">
          <h2>Refund Details</h2>
          <p>
            Refunds are issued to the original payment method. For Cash on Delivery orders, refunds are
            processed via bank transfer. Shipping charges are non-refundable unless the return is due to our error.
          </p>
        </section>

        <section className="policy-section">
          <h2>Need Help?</h2>
          <p>
            If you have questions about returns, please don't hesitate to{" "}
            <Link to="/contact">contact our support team</Link>. We're happy to help!
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicy;
