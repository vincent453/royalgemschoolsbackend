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

// ── WEBHOOK — must be FIRST before /:id catches it ───────────
// Raw body required for Paystack signature verification
router.post(
  "/paystack/webhook",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

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