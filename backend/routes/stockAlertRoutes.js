import express from "express";
import {
  subscribeStockAlert,
  checkStockAlert,
} from "../controllers/stockAlertController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/subscribe").post(isAuthenticated, subscribeStockAlert);
router.route("/check/:productId").get(isAuthenticated, checkStockAlert);

export default router;
