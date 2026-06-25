import express from "express";
import {
  createFeeStatement,
  getFeeStatements,
  getFeeStatementById,
  updateFeeStatement,
  deleteFeeStatement,
  getMyFeeStatements,
  initializePaystackPayment,
  handlePaystackWebhook,
} from "../controllers/feeController.js";
import {
  protectStaffAdmin,
  protectStudentOrPortal,
} from "../middleware/authMiddleware.js";
import { protectPortal } from "../middleware/portalMiddleware.js";

const router = express.Router();

// Admin billing management
router.post("/", protectStaffAdmin, createFeeStatement);
router.get("/", protectStaffAdmin, getFeeStatements);
router.get("/me/all", protectPortal, getMyFeeStatements);
router.post("/paystack/initialize", protectPortal, initializePaystackPayment);
router.get("/:id", protectStudentOrPortal, getFeeStatementById);
router.put("/:id", protectStaffAdmin, updateFeeStatement);
router.delete("/:id", protectStaffAdmin, deleteFeeStatement);

// Paystack webhook
router.post("/paystack/webhook", handlePaystackWebhook);

export default router;
