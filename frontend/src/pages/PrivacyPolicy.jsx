import { Link } from "react-router-dom";
import { FaShieldAlt, FaDatabase, FaCookieBite, FaUserLock } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <FaShieldAlt className="policy-hero-icon" />
        <h1>Privacy Policy</h1>
        <p>Your privacy matters to us. Here's how we protect your data.</p>
      </div>

      <div className="policy-content">
        <p className="policy-updated">Last updated: January 1, 2026</p>

        <section className="policy-section">
          <div className="policy-section-icon"><FaDatabase /></div>
          <h2>Information We Collect</h2>
          <p>We collect information to provide and improve our services. This includes:</p>
          <ul className="policy-list">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
            <li><strong>Payment Information:</strong> Card details are processed securely and are never stored on our servers.</li>
            <li><strong>Usage Data:</strong> Pages visited, products browsed, and interactions to improve your shopping experience.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and IP address for security and analytics.</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaUserLock /></div>
          <h2>How We Use Your Information</h2>
          <ul className="policy-list">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Improve our website, products, and services</li>
            <li>Send promotional offers (only with your consent)</li>
            <li>Prevent fraudulent activity and ensure security</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaShieldAlt /></div>
          <h2>Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your personal data, including
            encryption (SSL), secure payment processing, and restricted access to personal information.
          </p>
          <p>
            We never sell, rent, or share your personal information with third parties for their
            marketing purposes.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaCookieBite /></div>
          <h2>Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience, remember your preferences, and analyze
            site traffic. You can manage cookie preferences in your browser settings.
          </p>
          <p>Types of cookies we use:</p>
          <ul className="policy-list">
            <li><strong>Essential Cookies:</strong> Required for the website to function (e.g., authentication, cart).</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site.</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="policy-list">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>
            To exercise any of these rights, please <Link to="/contact">contact us</Link>.
          </p>
        </section>

        <section className="policy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page
            with an updated date. We encourage you to review this page periodically.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
