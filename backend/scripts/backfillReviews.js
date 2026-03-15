import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const hashString = (input) => {
  const s = String(input);
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

const firstNames = [
  "Ayaan",
  "Zara",
  "Ibrahim",
  "Aisha",
  "Hassan",
  "Fatima",
  "Omar",
  "Noor",
  "Ali",
  "Maryam",
  "Hamza",
  "Sana",
  "Bilal",
  "Hira",
  "Saad",
  "Anaya",
  "Rayan",
  "Eman",
  "Usman",
  "Mina",
  "Arham",
  "Laiba",
  "Adnan",
  "Iqra",
  "Danish",
  "Areeba",
  "Khadija",
  "Zain",
  "Sara",
  "Yusuf",
];

const lastNames = [
  "Khan",
  "Ahmed",
  "Ali",
  "Malik",
  "Raza",
  "Shah",
  "Hussain",
  "Butt",
  "Siddiqui",
  "Chaudhry",
  "Qureshi",
  "Sheikh",
  "Mirza",
  "Iqbal",
  "Nawaz",
  "Ansari",
  "Farooq",
  "Yousaf",
  "Akhtar",
  "Rehman",
];

const stableNameForUserId = (userId) => {
  const h = hashString(userId);
  const first = firstNames[h % firstNames.length];
  const last = lastNames[(Math.floor(h / 97) >>> 0) % lastNames.length];
  return `${first} ${last}`;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const generateRatingNear = (base = 4) => {
  const b = Number(base);
  const jitter = (Math.random() - 0.5) * 1.2; // +/- 0.6
  return clamp(Math.round((b + jitter) * 2) / 2, 1, 5);
};

const templates = [
  "Great quality and exactly as described.",
  "Value for money. Would recommend.",
  "Good product, delivery was fast.",
  "Comfortable and looks premium.",
  "Nice build quality. Satisfied with the purchase.",
  "Works as expected. Packaging was good.",
  "Loved it! Will buy again.",
  "Decent for the price.",
];

const renamePlaceholderUsers = async () => {
  const placeholderUsers = await User.find({
    role: "user",
    name: { $regex: /^User\s+\d+$/ },
  }).select("_id name");

  if (!placeholderUsers.length) return;

  const ops = placeholderUsers.map((u) => ({
    updateOne: {
      filter: { _id: u._id },
      update: { $set: { name: stableNameForUserId(u._id) } },
    },
  }));

  await User.bulkWrite(ops);
  console.log(`Renamed ${placeholderUsers.length} placeholder users.`);
};

const createDummyUsersIfNeeded = async (minUsers = 15) => {
  const existingCount = await User.countDocuments({});
  if (existingCount >= minUsers) return;

  const toCreate = minUsers - existingCount;
  const batch = [];

  for (let i = 0; i < toCreate; i += 1) {
    const unique = `${Date.now()}_${Math.floor(Math.random() * 1e9)}_${i}`;
    const first = pick(firstNames);
    const last = pick(lastNames);
    batch.push({
      name: `${first} ${last}`,
      email: `user_${unique}@example.com`,
      password: "password123",
      role: "user",
    });
  }

  await User.insertMany(batch);
};

const backfill = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected for backfill...");

  await createDummyUsersIfNeeded(25);
  await renamePlaceholderUsers();

  const products = await Product.find({}).select("_id name ratings").lean();
  const users = await User.find({ role: "user" }).select("_id name").lean();

  if (!products.length) {
    console.log("No products found. Nothing to backfill.");
    return;
  }

  if (users.length < 2) {
    console.log("Not enough users to create reviews.");
    return;
  }

  let createdReviews = 0;
  let updatedProducts = 0;

  for (const product of products) {
    const existing = await Review.countDocuments({ product: product._id });
    if (existing > 0) continue;

    // Create 2–3 reviews per product so the UI always has something to show.
    const desired = 2 + Math.floor(Math.random() * 2);
    const chosenUsers = new Set();
    const reviewDocs = [];

    while (reviewDocs.length < desired && chosenUsers.size < users.length) {
      const u = pick(users);
      const userId = String(u._id);
      if (chosenUsers.has(userId)) continue;
      chosenUsers.add(userId);

      const rating = generateRatingNear(product.ratings || 4);
      const comment = pick(templates);

      reviewDocs.push({
        user: u._id,
        product: product._id,
        rating,
        comment,
      });
    }

    if (reviewDocs.length > 0) {
      await Review.insertMany(reviewDocs);
      createdReviews += reviewDocs.length;

      const allReviews = await Review.find({ product: product._id }).select("rating").lean();
      const avg = allReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / allReviews.length;

      await Product.findByIdAndUpdate(product._id, {
        ratings: Math.round(avg * 10) / 10,
        numOfReviews: allReviews.length,
      });
      updatedProducts += 1;
    }
  }

  console.log(`Backfill done. Created reviews: ${createdReviews}. Updated products: ${updatedProducts}.`);
};

backfill()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  });
