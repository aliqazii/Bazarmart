import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getWishlist);
router.route("/toggle").post(isAuthenticated, toggleWishlist);

export default router;
