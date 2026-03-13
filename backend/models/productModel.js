
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },
    images: [
      {
        url: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      required: [true, "Please enter product category"],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colorOptions: [
      {
        name: { type: String, trim: true },
        swatch: { type: String, trim: true, default: "" },
        images: [
          {
            url: { type: String, required: true },
          },
        ],
      },
    ],
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", ""],
      default: "",
    },
    variants: [
      {
        sku: { type: String, trim: true },
        color: { type: String, trim: true },
        size: { type: String, trim: true },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        image: { type: String, default: "" },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    searchKeywords: {
      type: [String],
      default: [],
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      slug: { type: String, default: "" },
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      maxLength: [4, "Stock cannot exceed 4 characters"],
      default: 1,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);