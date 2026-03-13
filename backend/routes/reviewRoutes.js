import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createReview);
router.route("/product/:productId").get(getProductReviews);
router.route("/:id").delete(isAuthenticated, deleteReview);

export default router;
