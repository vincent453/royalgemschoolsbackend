import express from "express";
import { protectInventory } from "../middleware/authMiddleware.js";
import {
  createSupplier, getAllSuppliers, updateSupplier, deleteSupplier,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/",       protectInventory, getAllSuppliers);
router.post("/",      protectInventory,  createSupplier);
router.put("/:id",    protectInventory,  updateSupplier);
router.delete("/:id", protectInventory,  deleteSupplier);

export default router;
