import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCommentDots,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaMinus,
} from "react-icons/fa";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Welcome message on first open
  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
    if (messages.length === 0) {
      sendToBot("hi");
    }
  };

  const sendToBot = async (text) => {
    // Add user message (except auto-greeting)
    if (text !== "hi" || messages.length > 0) {
      setMessages((prev) => [...prev, { role: "user", text }]);
    }
    setIsTyping(true);

    try {
      const { data } = await axios.post("/api/v1/chatbot/message", {
        message: text,
      });

      // Simulate brief typing delay
      await new Promise((r) => setTimeout(r, 600));

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply,
          products: data.products || [],
          quickActions: data.quickActions || [],
        },
      ]);

      if (!isOpen || isMinimized) {
        setUnread((prev) => prev + 1);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again! 🔄",
          products: [],
          quickActions: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendToBot(trimmed);
  };

  const handleQuickAction = (action) => {
    if (action.startsWith("GO:")) {
      const path = action.replace("GO:", "");
      navigate(path);
      setIsOpen(false);
    } else {
      sendToBot(action);
    }
  };

  // Render markdown-lite (bold, links)
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\n)/g);
    return parts.map((part, i) => {
      if (part === "\n") return <br key={i} />;
      if (/^\*\*(.+)\*\*$/.test(part)) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
      if (linkMatch) {
        return (
          <Link key={i} to={linkMatch[2]} className="chatbot-link" onClick={() => setIsOpen(false)}>
            {linkMatch[1]}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`chatbot-toggle ${isOpen ? "chatbot-toggle-hidden" : ""}`}
        onClick={openChat}
        aria-label="Open chat"
      >
        <FaCommentDots />
        {unread > 0 && <span className="chatbot-badge">{unread}</span>}
      </button>

      {/* Chat window */}
      <div className={`chatbot-window ${isOpen ? "chatbot-open" : ""} ${isMinimized ? "chatbot-minimized" : ""}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <FaRobot />
            </div>
            <div>
              <h4>Bazarmart Assistant</h4>
              <span className="chatbot-status">
                <span className="chatbot-status-dot" />
                Online
              </span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button onClick={() => setIsMinimized(!isMinimized)} aria-label="Minimize">
              <FaMinus />
            </button>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                  {msg.role === "bot" && (
                    <div className="chatbot-msg-avatar">
                      <FaRobot />
                    </div>
                  )}
                  <div className="chatbot-msg-bubble">
                    <div className="chatbot-msg-text">{renderText(msg.text)}</div>

                    {/* Product cards */}
                    {msg.products?.length > 0 && (
                      <div className="chatbot-products">
                        {msg.products.map((p) => (
                          <Link
                            key={p._id}
                            to={`/product/${p._id}`}
                            className="chatbot-product-card"
                            onClick={() => setIsOpen(false)}
                          >
                            <img src={p.image} alt={p.name} />
                            <div className="chatbot-product-info">
                              <span className="chatbot-product-name">{p.name}</span>
                              <span className="chatbot-product-price">${p.price}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Quick actions */}
                    {msg.quickActions?.length > 0 && (
                      <div className="chatbot-quick-actions">
                        {msg.quickActions.map((qa, j) => (
                          <button key={j} onClick={() => handleQuickAction(qa.action)}>
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="chatbot-msg-avatar chatbot-msg-avatar-user">
                      <FaUser />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chatbot-msg chatbot-msg-bot">
                  <div className="chatbot-msg-avatar">
                    <FaRobot />
                  </div>
                  <div className="chatbot-msg-bubble chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chatbot-input" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                maxLength={500}
              />
              <button type="submit" disabled={!input.trim()} aria-label="Send message">
                <FaPaperPlane />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default ChatBot;
