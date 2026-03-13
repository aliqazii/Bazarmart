import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAddresses,
  addAddress,
  deleteAddress,
  getLoyaltyProfile,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/me").get(isAuthenticated, getUserProfile);
router.route("/me/update").put(isAuthenticated, updateProfile);
router
  .route("/me/addresses")
  .get(isAuthenticated, getAddresses)
  .post(isAuthenticated, addAddress);
router
  .route("/me/addresses/:addressId")
  .delete(isAuthenticated, deleteAddress);
router.route("/me/loyalty").get(isAuthenticated, getLoyaltyProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
