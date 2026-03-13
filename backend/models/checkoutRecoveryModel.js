import mongoose from "mongoose";

const checkoutRecoverySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cartItems: {
      type: Array,
      default: [],
    },
    shippingInfo: {
      type: Object,
      default: {},
    },
    couponCode: {
      type: String,
      default: "",
    },
    lastStep: {
      type: String,
      default: "cart",
    },
    abandoned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CheckoutRecovery", checkoutRecoverySchema);
