import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaCcVisa,
  FaCcMastercard,
  FaMoneyBillWave,
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaHeadset,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Trust Badges Bar */}
      <div className="trust-bar">
        <div className="trust-item">
          <FaTruck />
          <div>
            <strong>Free Shipping</strong>
            <span>On orders over $50</span>
          </div>
        </div>
        <div className="trust-item">
          <FaShieldAlt />
          <div>
            <strong>Secure Payment</strong>
            <span>100% protected</span>
          </div>
        </div>
        <div className="trust-item">
          <FaUndoAlt />
          <div>
            <strong>Easy Returns</strong>
            <span>30-day return policy</span>
          </div>
        </div>
        <div className="trust-item">
          <FaHeadset />
          <div>
            <strong>24/7 Support</strong>
            <span>Dedicated help</span>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h3>Subscribe to Our Newsletter</h3>
          <p>Get the latest deals, new arrivals, and exclusive offers straight to your inbox.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-brand">
            <h2 className="footer-logo">Bazarmart</h2>
            <p className="footer-about">
              Your one-stop shop for everything you need. Quality products, great prices, and exceptional service since 2024.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/profile">My Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/products?category=Electronics">Electronics</Link></li>
              <li><Link to="/products?category=Clothing">Clothing</Link></li>
              <li><Link to="/products?category=Shoes">Shoes</Link></li>
              <li><Link to="/products?category=Books">Books</Link></li>
              <li><Link to="/products?category=Accessories">Accessories</Link></li>
              <li><Link to="/products?category=Home">Home & Living</Link></li>
              <li><Link to="/products?category=Sports">Sports</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/contact">Help Center</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4>Get In Touch</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <FaMapMarkerAlt />
                <span>123 Commerce St, Lahore, Pakistan</span>
              </div>
              <div className="footer-contact-item">
                <FaPhoneAlt />
                <span>+92 300 1234567</span>
              </div>
              <div className="footer-contact-item">
                <FaEnvelope />
                <span>support@bazarmart.com</span>
              </div>
              <div className="footer-contact-item">
                <FaClock />
                <span>Mon - Sat: 9AM - 10PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Bazarmart. All rights reserved.</p>
          <div className="payment-methods">
            <span>We Accept:</span>
            <FaCcVisa />
            <FaCcMastercard />
            <FaMoneyBillWave title="Cash on Delivery" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
