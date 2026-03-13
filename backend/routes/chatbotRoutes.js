import express from "express";
import { chatbotMessage } from "../controllers/chatbotController.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// Optional auth — attach user if logged in, but don't require it
const optionalAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    req.user = null;
  }
  next();
};

router.route("/message").post(optionalAuth, chatbotMessage);

export default router;
