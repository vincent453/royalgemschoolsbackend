import express from "express";
import { protectStaffAdmin, protectAdminOrUser } from "../middleware/authMiddleware.js";
import {
  createSupplier, getAllSuppliers, updateSupplier, deleteSupplier,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/",       protectAdminOrUser, getAllSuppliers);
router.post("/",      protectStaffAdmin,  createSupplier);
router.put("/:id",    protectStaffAdmin,  updateSupplier);
router.delete("/:id", protectStaffAdmin,  deleteSupplier);

export default router;
