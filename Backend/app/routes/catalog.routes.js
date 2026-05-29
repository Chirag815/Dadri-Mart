import { Router } from "express";
import {
  getNearestStore,
  getStoreCatalog,
  updateInventoryStock,
  getStores
} from "../controllers/catalog.controllers.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middlewares.js";

const router = Router();

// public routes
router.route("/nearest-store").get(getNearestStore);
router.route("/products").get(getStoreCatalog);
router.route("/stores").get(getStores);

// admin routes (secured)
router.route("/update-stock").post(verifyJWT, authorizeRoles("admin"), updateInventoryStock);

export default router;
