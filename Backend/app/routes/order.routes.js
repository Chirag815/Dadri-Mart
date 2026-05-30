import { Router } from "express";
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getStoreOrders,
  updateOrderStatus,
  getAvailableDeliveries,
  acceptOrAssignRider
} from "../controllers/order.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require a valid JWT
router.use(verifyJWT);

// ── Customer routes ──────────────────────────────────────────────────────────
router.route("/").post(createOrder);
router.route("/customer/history").get(getCustomerOrders);

// ── Vendor / Admin routes ────────────────────────────────────────────────────
// NOTE: vendor role can now manage the full order lifecycle
router.route("/admin/all").get(authorizeRoles("admin", "vendor"), getStoreOrders);
router.route("/vendor/ready").get(authorizeRoles("admin", "vendor"), getAvailableDeliveries);
router.route("/:id/assign").post(authorizeRoles("admin", "vendor"), acceptOrAssignRider);
router.route("/:id/status").put(authorizeRoles("admin", "vendor"), updateOrderStatus);

// ── Single order (customer sees own, vendor/admin sees all) ──────────────────
router.route("/:id").get(getOrderById);

export default router;
