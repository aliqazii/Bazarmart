import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import catchAsync from "../middleware/catchAsync.js";

// Knowledge base for FAQ responses
const FAQ = {
  shipping: {
    keywords: ["shipping", "delivery", "deliver", "ship", "how long", "shipping cost", "free shipping"],
    response:
      "**Shipping**\n• Free shipping on orders over $50\n• Standard delivery: 5-7 business days\n• Express delivery: 2-3 business days ($9.99)\n• Tracking is provided for all orders\n\nFor full details, see: [Shipping Policy](/shipping-policy).",
  },
  returns: {
    keywords: ["return", "refund", "exchange", "money back", "send back", "return policy"],
    response:
      "**Returns & Refunds**\n• 30-day return window from delivery\n• Items must be unused and in original packaging\n• Refunds are processed within 5-7 business days after inspection\n• Exchanges are available for different sizes/colors\n\nSee: [Return Policy](/return-policy).",
  },
  payment: {
    keywords: ["payment", "pay", "credit card", "debit card", "payment method", "checkout"],
    response:
      "**Payments**\n• Credit/Debit cards (Visa, MasterCard, Amex)\n• Secure checkout powered by Stripe\n• Transactions are encrypted and processed securely",
  },
  account: {
    keywords: ["account", "register", "sign up", "login", "password", "forgot password"],
    response:
      "**Account Help**\n• Create an account: [Register](/register)\n• Sign in: [Login](/login)\n• View profile and order history in your account\n\nIf you cannot access your account, contact support from [Contact](/contact).",
  },
  contact: {
    keywords: ["contact", "support", "help", "customer service", "phone", "email"],
    response:
      "**Contact & Support**\n• Email: support@bazarmart.com\n• Live chat: available here\n\nYou can also use: [Contact](/contact).",
  },
  hours: {
    keywords: ["hours", "open", "available", "when"],
    response:
      "**Availability**\n• Chat assistant: 24/7\n• Support team: Mon-Fri 9AM-6PM\n• Email replies: within 24 hours",
  },
  terms: {
    keywords: ["terms", "conditions", "terms and conditions", "terms of service", "tos", "policy", "policies", "privacy", "privacy policy", "warranty", "guarantee"],
    response:
      "**Policies**\n• [Terms of Service](/terms-of-service)\n• [Privacy Policy](/privacy-policy)\n• [Return Policy](/return-policy)\n• [Shipping Policy](/shipping-policy)",
  },
  cart: {
    keywords: ["cart", "add to cart", "remove from cart", "view cart", "checkout", "place order"],
    response:
      "**Cart & Checkout**\n• Add items: click the cart button on a product\n• View cart: open the Cart page\n• Checkout: proceed from Cart to confirm your order\n\nIf you run into an error during checkout, tell me what you see and I will guide you.",
  },
  tracking: {
    keywords: ["tracking", "track order", "order status", "where is my order", "shipment"],
    response:
      "**Order Tracking**\n• Open: [Tracking](/tracking)\n• Or view order history after login in your profile\n\nIf you are logged in, ask: “Where is my order?” and I can show recent orders.",
  },
};

// Detect intent from message
function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|howdy|good morning|good evening|sup|yo)\b/.test(lower)) {
    return { type: "greeting" };
  }

  // Thanks / bye
  if (/^(thanks|thank you|bye|goodbye|see you|that's all|thats all)\b/.test(lower)) {
    return { type: "farewell" };
  }

  // Order tracking
  if (/\b(order|track|tracking|where is my|package|shipment|status)\b/.test(lower)) {
    return { type: "order_tracking" };
  }

  // Cart abandonment / discount
  if (/discount|coupon|promo|offer|deal|sale|abandon|cart reminder/.test(lower)) {
    return { type: "discount" };
  }

  // Product search with category
  const categoryMatch = lower.match(
    /\b(electronics|clothing|books|shoes|accessories|home|sports)\b/
  );

  // Product search with gender
  const genderMatch = lower.match(/\b(men'?s?|women'?s?|ladies|male|female)\b/);

  // Price extraction
  const priceMatch = lower.match(
    /(?:under|below|less than|cheaper than|up to|max|within)\s*\$?(\d+)/
  );
  const priceAboveMatch = lower.match(
    /(?:above|over|more than|at least|min|from)\s*\$?(\d+)/
  );

  // Product recommendation / shopping intent
  if (
    /\b(recommend|suggest|show me|looking for|find|search|want|need|buy|shop|best|popular|top rated|trending|deal|deals|sale|discount)\b/.test(lower) ||
    categoryMatch ||
    genderMatch ||
    priceMatch ||
    priceAboveMatch
  ) {
    const filters = {};
    if (categoryMatch) filters.category = categoryMatch[1];
    if (genderMatch) {
      const g = genderMatch[1].toLowerCase();
      filters.gender = /women|ladies|female/.test(g) ? "Women" : "Men";
      // Only apply gender to Clothing
      if (!filters.category) filters.category = "clothing";
    }
    if (priceMatch) filters.maxPrice = Number(priceMatch[1]);
    if (priceAboveMatch) filters.minPrice = Number(priceAboveMatch[1]);

    // Keyword extraction (remove common words)
    const keyword = lower
      .replace(
        /\b(show|me|find|search|recommend|suggest|looking|for|want|need|buy|shop|best|good|some|a|the|an|any|please|can|you|i|with|under|below|less|than|cheaper|up|to|above|over|more|at|least|from|in|of|men'?s?|women'?s?|ladies|male|female|electronics|clothing|books|shoes|accessories|home|sports|\$\d+|\d+)\b/g,
        ""
      )
      .replace(/[^\w\s]/g, "")
      .trim();

    return { type: "product_search", filters, keyword };
  }

  // FAQ detection
  for (const [key, faq] of Object.entries(FAQ)) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return { type: "faq", faqKey: key };
    }
  }

  return { type: "unknown" };
}

const OUT_OF_SCOPE_REPLY =
  "I can help with Bazarmart questions only (products, orders, shipping, returns, payments, account, and how to use the website).\n\nI cannot help with that question. If you rephrase it as a store/website question, I will try to assist.";

// Normalize category name to title case
function normalizeCategory(cat) {
  if (!cat) return null;
  const map = {
    electronics: "Electronics",
    clothing: "Clothing",
    books: "Books",
    shoes: "Shoes",
    accessories: "Accessories",
    home: "Home",
    sports: "Sports",
  };
  return map[cat.toLowerCase()] || null;
}

// Basic stemming — strip plural endings for better matching
function stem(word) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes"))
    return word.slice(0, -2);
  if (word.endsWith("es")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

// Build regex from keyword that matches both singular and plural
function keywordRegex(keyword) {
  const words = keyword.split(/\s+/).filter((w) => w.length > 1);
  const patterns = words.map((w) => stem(w));
  return patterns.join("|");
}

// Format product for response
function formatProducts(products) {
  return products.map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    image: p.images?.[0]?.url || "",
    category: p.category,
  }));
}

export const chatbotMessage = catchAsync(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const intent = detectIntent(message);
  let reply = "";
  let products = [];
  let quickActions = [];

  switch (intent.type) {
    case "greeting": {
      const name = req.user ? req.user.name.split(" ")[0] : "";
      reply = name
        ? `Hello ${name}. Welcome back to Bazarmart. How can I help you today?`
        : "Hello. Welcome to Bazarmart. How can I help you today?";
      quickActions = [
        { label: "Browse products", action: "Show me popular products" },
        { label: "Track an order", action: "Where is my order?" },
        { label: "Shipping", action: "Tell me about shipping" },
        { label: "Returns", action: "What's your return policy?" },
      ];
      break;
    }

    case "farewell": {
      reply = "Thank you for chatting with Bazarmart. If you need anything else, I am here to help.";
      break;
    }

    case "order_tracking": {
      if (!req.user) {
        reply =
          "To check your order status, please log in first.\n\nGo to: [Login](/login).";
        quickActions = [{ label: "🔑 Login", action: "GO:/login" }];
      } else {
        const orders = await Order.find({ user: req.user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        if (orders.length === 0) {
          reply = "You do not have any orders yet. You can browse products and place an order anytime.";
          quickActions = [{ label: "Shop now", action: "GO:/products" }];
        } else {
          const orderList = orders
            .map((o, i) => {
              const date = new Date(o.createdAt).toLocaleDateString();
              const status =
                o.orderStatus === "Delivered"
                  ? "✅ Delivered"
                  : o.orderStatus === "Shipped"
                  ? "🚚 Shipped"
                  : "⏳ Processing";
              return `${i + 1}. **$${o.totalPrice.toFixed(2)}** — ${status} (${date})`;
            })
            .join("\n");

          reply = `📦 **Your Recent Orders:**\n\n${orderList}\n\nClick an order below to view details:`;
          quickActions = orders.slice(0, 3).map((o) => ({
            label: `📋 Order $${o.totalPrice.toFixed(2)}`,
            action: `GO:/order/${o._id}`,
          }));
        }
      }
      break;
    }

    case "product_search": {
      const query = {};
      const { filters, keyword } = intent;

      if (filters.category) {
        query.category = normalizeCategory(filters.category);
      }
      // Only apply gender filter for Clothing
      if (filters.gender && query.category === "Clothing") {
        query.gender = filters.gender;
      }
      if (filters.maxPrice || filters.minPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }
      if (keyword && keyword.length > 1) {
        query.name = { $regex: keywordRegex(keyword), $options: "i" };
      }

      const found = await Product.find(query).limit(6).lean();

      if (found.length === 0 && keyword) {
        // Try individual keywords
        const words = keyword.split(/\s+/).filter((w) => w.length > 2);
        for (const word of words) {
          const stemmed = stem(word);
          const retryQuery = { ...query };
          delete retryQuery.name;
          retryQuery.name = { $regex: stemmed, $options: "i" };
          const retryFound = await Product.find(retryQuery).limit(6).lean();
          if (retryFound.length > 0) {
            products = formatProducts(retryFound);
            reply = `Here are some products matching "${word}":`;
            break;
          }
        }

        if (products.length === 0) {
          // Broaden search — drop keyword entirely
          delete query.name;
          const broader = await Product.find(query).limit(6).lean();
          if (broader.length > 0) {
            products = formatProducts(broader);
            reply = `I couldn't find an exact match, but here are some ${
              filters.category || ""
            } products you can browse:`;
          } else {
            reply =
              "I could not find products matching your criteria. Try a broader search or browse a category.";
            quickActions = [
              { label: "Electronics", action: "Show me electronics" },
              { label: "Clothing", action: "Show me clothing" },
              { label: "Shoes", action: "Show me shoes" },
              { label: "Home", action: "Show me home products" },
            ];
          }
        }
      } else if (found.length === 0) {
        reply =
          "I could not find products matching your criteria. Try a broader search or browse a category.";
        quickActions = [
          { label: "Electronics", action: "Show me electronics" },
          { label: "Clothing", action: "Show me clothing" },
          { label: "Shoes", action: "Show me shoes" },
          { label: "Home", action: "Show me home products" },
        ];
      } else {
        products = formatProducts(found);
        const desc = [];
        if (filters.gender) desc.push(filters.gender.toLowerCase());
        if (filters.category) desc.push(filters.category);
        if (filters.maxPrice) desc.push(`under $${filters.maxPrice}`);
        reply = `Here are ${found.length} ${desc.join(" ") || ""} products I found:`;
      }
      break;
    }

    case "discount": {
      reply =
        "**Offers**\n• Free shipping on orders over $50\n• Browse products to see current prices and deals";
      quickActions = [
        { label: "Trending", action: "Show me trending products" },
        { label: "All products", action: "GO:/products" },
      ];
      break;
    }

    case "faq": {
      reply = FAQ[intent.faqKey].response;
      break;
    }

    default: {
      reply = OUT_OF_SCOPE_REPLY;
      quickActions = [
        { label: "Find products", action: "Show me popular products" },
        { label: "Track order", action: "Where is my order?" },
        { label: "Shipping", action: "Tell me about shipping" },
        { label: "Returns", action: "What's your return policy?" },
        { label: "Payments", action: "What payment methods do you accept?" },
        { label: "Contact", action: "How do I contact support?" },
      ];
      break;
    }
  }

  res.status(200).json({
    success: true,
    reply,
    products,
    quickActions,
  });
});
