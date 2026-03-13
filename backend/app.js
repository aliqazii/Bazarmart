import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import stockAlertRoutes from "./routes/stockAlertRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import innovationRoutes from "./routes/innovationRoutes.js";
import rateLimit from "./middleware/rateLimit.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Bazarmart API is running" });
});

// Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/stock-alerts", stockAlertRoutes);
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/innovation", innovationRoutes);

// Error Middleware
app.use(errorMiddleware);

export default app;
