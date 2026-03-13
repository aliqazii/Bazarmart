import express from "express";
import {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  exportOrdersCSV,
} from "../controllers/orderController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/new").post(isAuthenticated, newOrder);
router.route("/me").get(isAuthenticated, myOrders);
router
  .route("/admin/all")
  .get(isAuthenticated, authorizeRoles("admin"), getAllOrders);
router
  .route("/admin/export/csv")
  .get(isAuthenticated, authorizeRoles("admin"), exportOrdersCSV);
router
  .route("/admin/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteOrder);
router.route("/:id").get(isAuthenticated, getSingleOrder);

export default router;
