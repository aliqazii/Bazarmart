import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: "US" },
      pinCode: { type: String, required: true },
      phoneNo: { type: String, required: true },
    },
    contactEmail: { type: String, default: "" },
    paymentInfo: {
      id: { type: String, required: true },
      status: { type: String, required: true },
      method: { type: String, default: "stripe" },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    statusTimeline: [
      {
        status: { type: String, default: "Processing" },
        note: { type: String, default: "Order placed" },
        at: { type: Date, default: Date.now },
      },
    ],
    suspiciousScore: { type: Number, default: 0 },
    returnRequested: { type: Boolean, default: false },
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected", "Refunded"],
      default: "None",
    },
    orderStatus: {
      type: String,
      required: true,
      default: "Processing",
      enum: ["Processing", "Shipped", "Delivered"],
    },
    deliveredAt: Date,
    paidAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
