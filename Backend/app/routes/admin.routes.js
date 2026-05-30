import { Router } from "express";
import {
  getPincodes,
  addPincode,
  removePincode,
  checkPincodeAvailable,
  getSettings,
  updateSettings,
  getAnalytics
} from "../controllers/admin.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public endpoints
router.route("/service-areas/check").get(checkPincodeAvailable);
router.route("/settings").get(getSettings);

// Admin-secured endpoints
router.route("/service-areas").get(verifyJWT, authorizeRoles("admin"), getPincodes);
router.route("/service-areas").post(verifyJWT, authorizeRoles("admin"), addPincode);
router.route("/service-areas/:id").delete(verifyJWT, authorizeRoles("admin"), removePincode);
router.route("/settings").put(verifyJWT, authorizeRoles("admin"), updateSettings);
router.route("/analytics").get(verifyJWT, authorizeRoles("admin"), getAnalytics);

export default router;
