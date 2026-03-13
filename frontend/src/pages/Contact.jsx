import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaQuestionCircle,
  FaTruck,
  FaUndoAlt,
  FaCreditCard,
  FaUserShield,
} from "react-icons/fa";

const faqs = [
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you can track it from the 'My Orders' page in your account. You'll also receive an email notification with tracking details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa credit/debit cards and Cash on Delivery (COD). All online payments are processed securely.",
  },
  {
    q: "What is your return policy?",
    a: "You can return any product within 30 days of delivery. The item must be unused and in its original packaging. Contact our support team to initiate a return.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days within Pakistan. Free shipping is available on orders over $50.",
  },
  {
    q: "How do I change or cancel my order?",
    a: "You can request a change or cancellation before the order is shipped. Go to 'My Orders' and contact support, or reach out to us via the form below.",
  },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [openFaq, setOpenFaq] = useState(null);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-hero">
        <h1>How Can We Help?</h1>
        <p>We're here to assist you. Reach out to us anytime.</p>
      </div>

      {/* Quick Help Cards */}
      <div className="quick-help-grid">
        <Link to="/shipping-policy" className="quick-help-card">
          <FaTruck />
          <h3>Shipping Info</h3>
          <p>Track your order or learn about our delivery options and timelines.</p>
        </Link>
        <Link to="/return-policy" className="quick-help-card">
          <FaUndoAlt />
          <h3>Returns & Refunds</h3>
          <p>Easy 30-day return policy. No questions asked for unused items.</p>
        </Link>
        <Link to="/shipping" className="quick-help-card">
          <FaCreditCard />
          <h3>Payment Issues</h3>
          <p>Having trouble with payment? We support Visa and Cash on Delivery.</p>
        </Link>
        <Link to="/profile" className="quick-help-card">
          <FaUserShield />
          <h3>Account & Security</h3>
          <p>Help with account access, password reset, or security concerns.</p>
        </Link>
      </div>

      {/* Contact Info + Form */}
      <div className="contact-content">
        <div className="contact-info-side">
          <h2>Contact Information</h2>
          <p className="contact-info-subtitle">
            Fill out the form or use the contact details below. We typically respond within 24 hours.
          </p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <strong>Our Office</strong>
                <p>123 Commerce Street, Gulberg III, Lahore, Pakistan</p>
              </div>
            </div>
            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <FaPhoneAlt />
              </div>
              <div>
                <strong>Phone</strong>
                <p>+92 300 1234567</p>
                <p className="detail-note">Mon-Sat, 9AM - 10PM PKT</p>
              </div>
            </div>
            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <FaEnvelope />
              </div>
              <div>
                <strong>Email</strong>
                <p>support@bazarmart.com</p>
                <p className="detail-note">We reply within 24 hours</p>
              </div>
            </div>
            <div className="contact-detail-item">
              <div className="contact-detail-icon">
                <FaClock />
              </div>
              <div>
                <strong>Business Hours</strong>
                <p>Monday - Saturday: 9AM - 10PM</p>
                <p>Sunday: 12PM - 8PM</p>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="contact-map">
            <iframe
              title="Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108887.89332974643!2d74.2328081!3d31.4831587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23abe6ccc7e2462!2sLahore%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000"
              width="100%"
              height="220"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-side">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Your Email</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-subject">Subject</label>
              <select
                id="contact-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a topic</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Shipping & Delivery">Shipping & Delivery</option>
                <option value="Returns & Refunds">Returns & Refunds</option>
                <option value="Payment Problem">Payment Problem</option>
                <option value="Product Question">Product Question</option>
                <option value="Account Help">Account Help</option>
                <option value="Feedback">Feedback & Suggestions</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your issue or question in detail..."
                required
              ></textarea>
            </div>
            <button type="submit" className="contact-submit-btn" disabled={sending}>
              <FaPaperPlane /> {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="faq-header">
          <FaQuestionCircle />
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? "open" : ""}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
