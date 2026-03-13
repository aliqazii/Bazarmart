import express from "express";
import {
  processPayment,
  sendStripeApiKey,
  processLocalPayment,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/process").post(isAuthenticated, processPayment);
router.route("/process/local").post(isAuthenticated, processLocalPayment);
router.route("/stripeapikey").get(isAuthenticated, sendStripeApiKey);

export default router;
