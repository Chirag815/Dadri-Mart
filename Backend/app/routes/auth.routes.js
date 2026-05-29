import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserAddress,
  getAllUsers
} from "../controllers/auth.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middlewares.js";

const router = Router();

// public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getCurrentUser);
router.route("/address").put(verifyJWT, updateUserAddress);
router.route("/users").get(verifyJWT, authorizeRoles("admin"), getAllUsers);

export default router;
