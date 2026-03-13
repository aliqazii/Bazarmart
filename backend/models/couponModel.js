import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please enter coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: [true, "Please enter discount percentage"],
      min: [1, "Discount must be at least 1%"],
      max: [90, "Discount cannot exceed 90%"],
    },
    minAmount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, "Please set expiry date"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
