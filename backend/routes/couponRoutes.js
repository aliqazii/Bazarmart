import express from "express";
import {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/validate").post(isAuthenticated, validateCoupon);
router
  .route("/admin")
  .get(isAuthenticated, authorizeRoles("admin"), getAllCoupons)
  .post(isAuthenticated, authorizeRoles("admin"), createCoupon);
router
  .route("/admin/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteCoupon);

export default router;
