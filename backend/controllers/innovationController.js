import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import CheckoutRecovery from "../models/checkoutRecoveryModel.js";
import ReturnRequest from "../models/returnRequestModel.js";
import catchAsync from "../middleware/catchAsync.js";
import ErrorHandler from "../utils/errorHandler.js";

export const saveCheckoutRecovery = catchAsync(async (req, res) => {
  const payload = {
    cartItems: req.body.cartItems || [],
    shippingInfo: req.body.shippingInfo || {},
    couponCode: req.body.couponCode || "",
    lastStep: req.body.lastStep || "cart",
    abandoned: req.body.abandoned || false,
  };

  const doc = await CheckoutRecovery.findOneAndUpdate(
    { user: req.user._id },
    { ...payload, user: req.user._id },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true, recovery: doc });
});

export const getCheckoutRecovery = catchAsync(async (req, res) => {
  const recovery = await CheckoutRecovery.findOne({ user: req.user._id });
  res.status(200).json({ success: true, recovery });
});

export const advancedSearch = catchAsync(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(200).json({ success: true, products: [] });

  const regex = new RegExp(q, "i");
  const products = await Product.find({
    $or: [
      { name: regex },
      { description: regex },
      { category: regex },
      { tags: regex },
      { searchKeywords: regex },
    ],
  }).limit(30);

  const scored = products
    .map((p) => {
      let score = 0;
      if (p.name?.toLowerCase().includes(q.toLowerCase())) score += 5;
      if (p.category?.toLowerCase().includes(q.toLowerCase())) score += 2;
      score += (p.ratings || 0) * 0.8;
      score += Math.min(p.numOfReviews || 0, 200) * 0.01;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  res.status(200).json({ success: true, products: scored });
});

export const getProductRecommendations = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const products = await Product.find({
    _id: { $ne: product._id },
    $or: [
      { category: product.category },
      { price: { $gte: product.price * 0.7, $lte: product.price * 1.3 } },
    ],
  })
    .sort({ ratings: -1, numOfReviews: -1 })
    .limit(8);

  res.status(200).json({ success: true, products });
});

export const getPersonalizedRecommendations = catchAsync(async (req, res) => {
  const myOrders = await Order.find({ user: req.user._id });
  const categories = new Set();
  myOrders.forEach((o) => {
    o.orderItems.forEach((item) => {
      if (item.category) categories.add(item.category);
    });
  });

  const query = categories.size > 0 ? { category: { $in: [...categories] } } : {};
  const products = await Product.find(query)
    .sort({ ratings: -1, createdAt: -1 })
    .limit(12);

  res.status(200).json({ success: true, products });
});

export const getTrackingTimeline = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorHandler("Not authorized to view this tracking", 403));
  }

  res.status(200).json({
    success: true,
    tracking: {
      orderId: order._id,
      courier: order.courier || "Pending",
      trackingNumber: order.trackingNumber || "Pending",
      timeline: order.statusTimeline || [],
      currentStatus: order.orderStatus,
    },
  });
});

export const updateTrackingTimeline = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  order.courier = req.body.courier || order.courier;
  order.trackingNumber = req.body.trackingNumber || order.trackingNumber;

  if (req.body.status) {
    order.orderStatus = req.body.status;
    order.statusTimeline.push({
      status: req.body.status,
      note: req.body.note || "Status updated",
      at: new Date(),
    });
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, order });
});

export const createReturnRequest = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  const request = await ReturnRequest.create({
    order: order._id,
    user: req.user._id,
    reason: req.body.reason,
    notes: req.body.notes || "",
    refundAmount: req.body.refundAmount || 0,
  });

  order.returnRequested = true;
  order.returnStatus = "Requested";
  await order.save({ validateBeforeSave: false });

  res.status(201).json({ success: true, request });
});

export const myReturnRequests = catchAsync(async (req, res) => {
  const requests = await ReturnRequest.find({ user: req.user._id }).populate("order");
  res.status(200).json({ success: true, requests });
});

export const adminReturnRequests = catchAsync(async (req, res) => {
  const requests = await ReturnRequest.find().populate("user", "name email").populate("order");
  res.status(200).json({ success: true, requests });
});

export const updateReturnRequest = catchAsync(async (req, res, next) => {
  const request = await ReturnRequest.findById(req.params.id);
  if (!request) return next(new ErrorHandler("Return request not found", 404));

  request.status = req.body.status || request.status;
  if (typeof req.body.refundAmount === "number") request.refundAmount = req.body.refundAmount;
  await request.save({ validateBeforeSave: false });

  await Order.findByIdAndUpdate(request.order, {
    returnStatus: request.status,
  });

  res.status(200).json({ success: true, request });
});

export const getLoyaltySummary = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    loyalty: {
      points: user.loyaltyPoints || 0,
      tier: user.loyaltyTier || "Bronze",
      referralCode: user.referralCode,
      ordersCount: orders.length,
    },
  });
});

export const getAnalyticsOverview = catchAsync(async (req, res) => {
  const [users, products, orders] = await Promise.all([
    User.find(),
    Product.find(),
    Order.find(),
  ]);

  const totalRevenue = orders.reduce((a, o) => a + (o.totalPrice || 0), 0);
  const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;
  const conversion = users.length ? ((orders.length / users.length) * 100).toFixed(2) : "0.00";

  const categoryMap = {};
  products.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    metrics: {
      users: users.length,
      products: products.length,
      orders: orders.length,
      delivered,
      revenue: totalRevenue,
      conversionRate: Number(conversion),
      categories: categoryMap,
      repeatCustomers: new Set(orders.map((o) => String(o.user))).size,
    },
  });
});

export const getSitemap = catchAsync(async (req, res) => {
  const products = await Product.find().select("_id updatedAt");
  const base = process.env.FRONTEND_URL || "http://localhost:5173";

  const urls = [
    `${base}/`,
    `${base}/products`,
    ...products.map((p) => `${base}/product/${p._id}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
});

export const fraudScoreOrder = catchAsync(async (req, res) => {
  const { totalPrice = 0, paymentMethod = "", quantity = 1 } = req.body;
  let score = 0;

  if (Number(totalPrice) > 1000) score += 45;
  if (Number(quantity) > 10) score += 20;
  if (String(paymentMethod).toLowerCase().includes("cod")) score += 10;

  const riskLevel = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  res.status(200).json({ success: true, score, riskLevel });
});
