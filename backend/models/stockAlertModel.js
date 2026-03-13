import mongoose from "mongoose";

const stockAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

stockAlertSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("StockAlert", stockAlertSchema);
