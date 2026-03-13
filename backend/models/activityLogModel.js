import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_PRODUCT",
        "UPDATE_PRODUCT",
        "DELETE_PRODUCT",
        "UPDATE_ORDER",
        "DELETE_ORDER",
        "UPDATE_USER_ROLE",
        "DELETE_USER",
        "CREATE_COUPON",
        "DELETE_COUPON",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Product", "Order", "User", "Coupon"],
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
