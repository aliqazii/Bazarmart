import express from "express";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";
import {
  saveCheckoutRecovery,
  getCheckoutRecovery,
  advancedSearch,
  getProductRecommendations,
  getPersonalizedRecommendations,
  getTrackingTimeline,
  updateTrackingTimeline,
  createReturnRequest,
  myReturnRequests,
  adminReturnRequests,
  updateReturnRequest,
  getLoyaltySummary,
  getAnalyticsOverview,
  getSitemap,
  fraudScoreOrder,
} from "../controllers/innovationController.js";

const router = express.Router();

router.route("/checkout/recovery")
  .post(isAuthenticated, saveCheckoutRecovery)
  .get(isAuthenticated, getCheckoutRecovery);

router.route("/search/advanced").get(advancedSearch);
router.route("/recommendations/product/:productId").get(getProductRecommendations);
router.route("/recommendations/me").get(isAuthenticated, getPersonalizedRecommendations);

router.route("/tracking/:orderId").get(isAuthenticated, getTrackingTimeline);
router.route("/tracking/:orderId/admin").put(isAuthenticated, authorizeRoles("admin"), updateTrackingTimeline);

router.route("/returns").post(isAuthenticated, createReturnRequest);
router.route("/returns/me").get(isAuthenticated, myReturnRequests);
router.route("/returns/admin").get(isAuthenticated, authorizeRoles("admin"), adminReturnRequests);
router.route("/returns/:id/admin").put(isAuthenticated, authorizeRoles("admin"), updateReturnRequest);

router.route("/loyalty/me").get(isAuthenticated, getLoyaltySummary);
router.route("/analytics/admin/overview").get(isAuthenticated, authorizeRoles("admin"), getAnalyticsOverview);

router.route("/seo/sitemap.xml").get(getSitemap);
router.route("/fraud/score").post(isAuthenticated, fraudScoreOrder);

export default router;
