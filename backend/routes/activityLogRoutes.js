import express from "express";
import { getActivityLogs } from "../controllers/activityLogController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, authorizeRoles("admin"), getActivityLogs);

export default router;
