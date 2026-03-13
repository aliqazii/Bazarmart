import { Link } from "react-router-dom";
import { FaFileContract, FaShoppingBag, FaUserCheck, FaGavel } from "react-icons/fa";

const TermsOfService = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <FaFileContract className="policy-hero-icon" />
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using our website.</p>
      </div>

      <div className="policy-content">
        <p className="policy-updated">Last updated: January 1, 2026</p>

        <section className="policy-section">
          <div className="policy-section-icon"><FaFileContract /></div>
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using Bazarmart, you agree to be bound by these Terms of Service and our{" "}
            <Link to="/privacy-policy">Privacy Policy</Link>. If you do not agree with any part of
            these terms, please do not use our website.
          </p>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaUserCheck /></div>
          <h2>Account Responsibilities</h2>
          <ul className="policy-list">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You agree to provide accurate and complete information during registration.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>Notify us immediately if you suspect unauthorized access to your account.</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaShoppingBag /></div>
          <h2>Orders & Payments</h2>
          <ul className="policy-list">
            <li>All prices are displayed in USD and include applicable taxes unless stated otherwise.</li>
            <li>We reserve the right to cancel orders due to pricing errors, stock unavailability, or suspected fraud.</li>
            <li>Payment must be completed at checkout (Visa/Debit) or upon delivery (Cash on Delivery).</li>
            <li>Orders cannot be modified once they have been shipped.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Product Information</h2>
          <p>
            We strive to display product information, images, and descriptions as accurately as
            possible. However, we do not guarantee that colors, sizes, or specifications are 100% accurate
            due to monitor display differences.
          </p>
        </section>

        <section className="policy-section">
          <h2>Intellectual Property</h2>
          <p>
            All content on Bazarmart — including logos, text, images, graphics, and software — is our
            property or the property of our licensors and is protected by intellectual property laws.
            You may not reproduce, distribute, or create derivative works without express written permission.
          </p>
        </section>

        <section className="policy-section">
          <h2>Prohibited Activities</h2>
          <ul className="policy-list">
            <li>Using the website for any unlawful purpose</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Interfering with the website's operation or performance</li>
            <li>Submitting false information or impersonating others</li>
            <li>Automated scraping or data collection without permission</li>
          </ul>
        </section>

        <section className="policy-section">
          <div className="policy-section-icon"><FaGavel /></div>
          <h2>Limitation of Liability</h2>
          <p>
            Bazarmart shall not be liable for any indirect, incidental, or consequential damages arising
            from the use of our services. Our total liability is limited to the amount you paid for
            the product or service in question.
          </p>
        </section>

        <section className="policy-section">
          <h2>Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the website after changes constitutes
            acceptance of the new terms. We encourage you to review this page periodically.
          </p>
        </section>

        <section className="policy-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please{" "}
            <Link to="/contact">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
