import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  searchAutocomplete,
  advancedProductSearch,
  getProductRecommendations,
  getAdminProductSummary,
} from "../controllers/productController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(getAllProducts);
router.route("/search/autocomplete").get(searchAutocomplete);
router.route("/search/advanced").get(advancedProductSearch);
router.route("/:id/recommendations").get(getProductRecommendations);
router
  .route("/admin/new")
  .post(isAuthenticated, authorizeRoles("admin"), createProduct);

router
  .route("/admin/summary")
  .get(isAuthenticated, authorizeRoles("admin"), getAdminProductSummary);

router.route("/:id").get(getProductDetails);
router
  .route("/admin/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

export default router;
