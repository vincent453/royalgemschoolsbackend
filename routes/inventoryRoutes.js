import express from "express";
import { protect, protectStaffAdmin, protectAdminOrUser } from "../middleware/authMiddleware.js";
import {
  createInventoryItem, getAllInventory, getInventoryById,
  updateInventoryItem, deleteInventoryItem,
  stockIn, stockOut, adjustStock,
  recordPurchase, getPurchases,
  getInventoryReport, getLowStock, getOutOfStock,
} from "../controllers/inventoryController.js";

const router = express.Router();

// All routes require at least staff auth
router.use(protectAdminOrUser);

// ── Reports (specific routes BEFORE /:id) ────────────────────
router.get("/report",       getInventoryReport);
router.get("/low-stock",    getLowStock);
router.get("/out-of-stock", getOutOfStock);
router.get("/purchases",    getPurchases);

// ── Stock movements ───────────────────────────────────────────
router.post("/stock-in",  stockIn);
router.post("/stock-out", stockOut);
router.post("/adjust",    adjustStock);

// ── Purchases ─────────────────────────────────────────────────
router.post("/purchase", recordPurchase);

// ── CRUD ─────────────────────────────────────────────────────
router.get("/",       getAllInventory);
router.post("/",      protectStaffAdmin, createInventoryItem);
router.get("/:id",    getInventoryById);
router.put("/:id",    protectStaffAdmin, updateInventoryItem);
router.delete("/:id", protect, deleteInventoryItem);

export default router;
