import express from "express";
import {
  createFeeStatement,
  getFeeStatements,
  getFeeStatementById,
  updateFeeStatement,
  deleteFeeStatement,
  getMyFeeStatements,
  initializePaystackPayment,
} from "../controllers/feeController.js";
import {
  protectStaffAdmin,
  protectStudentOrPortal,
} from "../middleware/authMiddleware.js";
import { protectPortal } from "../middleware/portalMiddleware.js";

const router = express.Router();

// NOTE: the Paystack webhook for fee payments has moved to the
// unified endpoint at /api/webhooks/paystack (see routes/paystackWebhookRoutes.js).
// Paystack only supports one webhook URL per mode on the whole account,
// so shop and fee payments are now both handled there.

// ── PAYMENT INITIALIZE ────────────────────────────────────────
router.post("/paystack/initialize", protectPortal, initializePaystackPayment);

// ── STUDENT / PARENT ──────────────────────────────────────────
router.get("/me/all", protectPortal, getMyFeeStatements);

// ── ADMIN ─────────────────────────────────────────────────────
router.post("/", protectStaffAdmin, createFeeStatement);
router.get("/",  protectStaffAdmin, getFeeStatements);

// ── SINGLE RECORD — keep :id routes LAST ─────────────────────
router.get("/:id",    protectStudentOrPortal, getFeeStatementById);
router.put("/:id",    protectStaffAdmin,       updateFeeStatement);
router.delete("/:id", protectStaffAdmin,       deleteFeeStatement);

export default router;