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

// secured routes
router.use(verifyJWT);

// Customer endpoints
router.route("/").post(createOrder);
router.route("/customer/history").get(getCustomerOrders);
router.route("/:id").get(getOrderById);

// Admin/Packer endpoints
router.route("/admin/all").get(authorizeRoles("admin"), getStoreOrders);
router.route("/:id/assign").post(authorizeRoles("admin", "rider"), acceptOrAssignRider);
router.route("/:id/status").put(authorizeRoles("admin", "rider"), updateOrderStatus);

// Rider endpoints
router.route("/rider/available").get(authorizeRoles("rider"), getAvailableDeliveries);

export default router;
