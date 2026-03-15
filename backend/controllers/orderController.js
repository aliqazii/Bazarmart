import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import ActivityLog from "../models/activityLogModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";
import { sendOrderConfirmationEmail } from "../utils/orderEmail.js";

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create new Order
export const newOrder = catchAsync(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    couponCode,
    discountAmount,
    contactEmail,
  } = req.body;

  // Resolve products + verify stock before making any stock changes
  const resolvedProducts = new Map(); // productId -> productDoc
  const quantityByProductId = new Map(); // productId -> totalQuantity

  for (const item of orderItems) {
    let productDoc = null;

    // Prefer id lookup
    try {
      if (item.product) {
        productDoc = await Product.findById(item.product);
      }
    } catch {
      productDoc = null;
    }

    // Fallback: exact name match (case-insensitive) for stale carts
    if (!productDoc && item.name) {
      const name = String(item.name).trim();
      if (name) {
        productDoc = await Product.findOne({ name: { $regex: `^${escapeRegExp(name)}$`, $options: "i" } });
        if (!productDoc) {
          productDoc = await Product.findOne({ name: { $regex: escapeRegExp(name), $options: "i" } });
        }
        if (productDoc) {
          item.product = productDoc._id;
        }
      }
    }

    if (!productDoc) {
      return next(new ErrorHandler(`Product not found: ${item.name}`, 404));
    }

    const idKey = productDoc._id.toString();
    resolvedProducts.set(idKey, productDoc);
    quantityByProductId.set(idKey, (quantityByProductId.get(idKey) || 0) + Number(item.quantity || 0));
  }

  for (const [idKey, totalQty] of quantityByProductId.entries()) {
    const productDoc = resolvedProducts.get(idKey) || (await Product.findById(idKey));
    if (!productDoc) {
      return next(new ErrorHandler("Product not found during stock validation", 404));
    }

    if (productDoc.stock < totalQty) {
      return next(
        new ErrorHandler(
          `Insufficient stock for ${productDoc.name}. Only ${productDoc.stock} left.`,
          400
        )
      );
    }
  }

  // Reduce stock only after all validations pass
  for (const [idKey, totalQty] of quantityByProductId.entries()) {
    const productDoc = resolvedProducts.get(idKey) || (await Product.findById(idKey));
    productDoc.stock -= totalQty;
    await productDoc.save({ validateBeforeSave: false });
  }

  const order = await Order.create({
    orderItems,
    shippingInfo,
    contactEmail: String(contactEmail || req.user?.email || "").trim().toLowerCase(),
    paymentInfo,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    couponCode: couponCode || "",
    discountAmount: discountAmount || 0,
    suspiciousScore:
      (Number(totalPrice) > 1000 ? 40 : 0) +
      (orderItems.reduce((a, i) => a + Number(i.quantity || 0), 0) > 10 ? 20 : 0) +
      (String(paymentInfo?.status || "").toLowerCase().includes("cash") ? 10 : 0),
    statusTimeline: [
      {
        status: "Processing",
        note: "Order placed",
        at: Date.now(),
      },
    ],
    paidAt: Date.now(),
    user: req.user._id,
  });

  const recipientEmail = String(contactEmail || req.user?.email || "").trim().toLowerCase();
  if (recipientEmail) {
    try {
      await sendOrderConfirmationEmail({
        to: recipientEmail,
        order: {
          ...order.toObject(),
          user: { name: req.user?.name || "Customer" },
        },
      });
    } catch (mailError) {
      // Do not block checkout if email delivery fails.
      console.warn("Order confirmation email failed:", mailError.message);
    }
  }

  // Use coupon if provided
  if (couponCode) {
    const { useCoupon } = await import("./couponController.js");
    await useCoupon(couponCode);
  }

  res.status(201).json({
    success: true,
    order,
  });
});

// Get Single Order
export const getSingleOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get Logged in User Orders
export const myOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get All Orders -- Admin
export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email");

  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Export Orders as CSV -- Admin
export const exportOrdersCSV = catchAsync(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });

  const header = "Order ID,Customer,Email,Items,Total,Payment,Status,Date\n";
  const rows = orders.map((o) => {
    const customer = o.user?.name || "N/A";
    const email = o.contactEmail || o.user?.email || "N/A";
    const items = o.orderItems.length;
    const date = new Date(o.createdAt).toLocaleDateString();
    return `${o._id},"${customer}","${email}",${items},${o.totalPrice.toFixed(2)},${o.paymentInfo?.status || "N/A"},${o.orderStatus},${date}`;
  });

  const csv = header + rows.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
  res.status(200).send(csv);
});

// Update Order Status -- Admin
export const updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order has already been delivered", 400));
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = req.body.status;
  order.statusTimeline.push({
    status: req.body.status,
    note: req.body.note || `Status moved to ${req.body.status}`,
    at: Date.now(),
  });

  if (req.body.courier) order.courier = req.body.courier;
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
    const user = await User.findById(order.user);
    if (user) {
      const points = Math.floor((order.totalPrice || 0) / 10);
      user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
      if (user.loyaltyPoints >= 500) user.loyaltyTier = "Platinum";
      else if (user.loyaltyPoints >= 250) user.loyaltyTier = "Gold";
      else if (user.loyaltyPoints >= 100) user.loyaltyTier = "Silver";
      else user.loyaltyTier = "Bronze";
      await user.save({ validateBeforeSave: false });
    }
  }

  await order.save({ validateBeforeSave: false });

  await ActivityLog.create({
    user: req.user._id,
    action: "UPDATE_ORDER",
    entityType: "Order",
    entityId: order._id,
    details: `Changed order #${order._id.toString().slice(-6)} status from ${oldStatus} to ${req.body.status}`,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Delete Order -- Admin
export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await ActivityLog.create({
    user: req.user._id,
    action: "DELETE_ORDER",
    entityType: "Order",
    entityId: order._id,
    details: `Deleted order #${order._id.toString().slice(-6)}`,
  });

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
