import { Link } from "react-router-dom";
import { FaTruck, FaBoxOpen, FaGlobeAmericas, FaClock } from "react-icons/fa";

const ShippingPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <FaTruck className="policy-hero-icon" />
        <h1>Shipping Policy</h1>
        <p>Everything you need to know about our shipping and delivery.</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <div className="policy-section-icon"><FaBoxOpen /></div>
          <h2>Processing Time</h2>
          <p>
            All orders are processed within <strong>1–2 business days</strong> after payment confirmation.
            Orders placed on weekends or public holidays will be processed on the next working day.
          </p>
          <p>
            You will receive an email confirmation with a tracking number once your order has been shipped.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaTruck /></div>
          <h2>Delivery Times</h2>
          <div className="policy-table-wrap">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Shipping Method</th>
                  <th>Estimated Delivery</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Shipping</td>
                  <td>3–5 business days</td>
                  <td>$10.00</td>
                </tr>
                <tr>
                  <td>Free Shipping (orders over $100)</td>
                  <td>3–5 business days</td>
                  <td>FREE</td>
                </tr>
                <tr>
                  <td>Express Shipping</td>
                  <td>1–2 business days</td>
                  <td>$25.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="policy-note">
            Delivery times are estimates and may vary due to carrier delays, weather, or high-volume periods.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaGlobeAmericas /></div>
          <h2>Shipping Coverage</h2>
          <p>
            We currently ship across <strong>Pakistan</strong>. We are working on expanding to international destinations.
          </p>
          <p>
            For remote or hard-to-reach areas, an additional 1–3 days may be added to the delivery estimate.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaClock /></div>
          <h2>Order Tracking</h2>
          <p>
            Once your order has been dispatched, you can track it from the{" "}
            <Link to="/orders">My Orders</Link> page. A tracking number will also be included in the
            shipment confirmation email.
          </p>
        </section>

        <section className="policy-section">
          <h2>Lost or Damaged Shipments</h2>
          <p>
            If your package is lost or arrives damaged, please <Link to="/contact">contact us</Link>{" "}
            within 48 hours of delivery. We will arrange a replacement or full refund at no extra cost.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
