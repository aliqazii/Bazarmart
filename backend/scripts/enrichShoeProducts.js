import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DEFAULT_SHOE_SIZES = ["39", "40", "41", "42", "43", "44"];

const COLOR_SWATCHES = {
  Black: "#111111",
  White: "#f5f5f5",
  Red: "#dc2626",
  Blue: "#2563eb",
  Brown: "#8b5e3c",
  Gold: "#d4a017",
  Beige: "#d6b48a",
  Cream: "#f3e7c9",
  Silver: "#c0c0c0",
  Pink: "#ec4899",
  Grey: "#9ca3af",
};

const inferPrimaryColor = (name = "") => {
  const normalized = String(name).toLowerCase();
  if (normalized.includes("black")) return "Black";
  if (normalized.includes("white")) return "White";
  if (normalized.includes("red")) return "Red";
  if (normalized.includes("blue")) return "Blue";
  if (normalized.includes("brown")) return "Brown";
  if (normalized.includes("gold") || normalized.includes("golden")) return "Gold";
  if (normalized.includes("beige")) return "Beige";
  if (normalized.includes("cream")) return "Cream";
  if (normalized.includes("silver")) return "Silver";
  if (normalized.includes("pink")) return "Pink";
  if (normalized.includes("grey") || normalized.includes("gray")) return "Grey";
  return "Black";
};

const paletteForProduct = (productName = "") => {
  const primary = inferPrimaryColor(productName);
  const palettes = {
    Black: ["Black", "White", "Brown"],
    White: ["White", "Black", "Blue"],
    Red: ["Red", "Black", "White"],
    Blue: ["Blue", "White", "Black"],
    Brown: ["Brown", "Black", "Beige"],
    Gold: ["Gold", "Black", "Beige"],
    Beige: ["Beige", "Brown", "Black"],
    Cream: ["Cream", "Brown", "Black"],
    Silver: ["Silver", "Black", "White"],
    Pink: ["Pink", "White", "Black"],
    Grey: ["Grey", "Black", "White"],
  };
  return palettes[primary] || [primary, "Black", "White"];
};

const buildColorOptions = (product) => {
  const baseImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((image) => ({ url: image.url }))
    : [{ url: "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image" }];

  return paletteForProduct(product.name).map((colorName) => ({
    name: colorName,
    swatch: COLOR_SWATCHES[colorName] || "#374151",
    images: baseImages,
  }));
};

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const shoes = await Product.find({ category: "Shoes" });
    let updated = 0;

    for (const shoe of shoes) {
      shoe.sizes = shoe.sizes?.length > 0 ? shoe.sizes : DEFAULT_SHOE_SIZES;
      shoe.colorOptions = shoe.colorOptions?.length >= 2 ? shoe.colorOptions : buildColorOptions(shoe);

      if (!shoe.gender) {
        const normalized = shoe.name.toLowerCase();
        if (normalized.includes("woman") || normalized.includes("women") || normalized.includes("heel")) {
          shoe.gender = "Women";
        } else if (normalized.includes("men") || normalized.includes("mens")) {
          shoe.gender = "Men";
        } else {
          shoe.gender = "Unisex";
        }
      }

      await shoe.save({ validateBeforeSave: false });
      updated += 1;
    }

    console.log(`Updated ${updated} shoe products with sizes and color options.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to enrich shoe products:", error.message);
    process.exit(1);
  }
};

main();