import express from "express";
import {
  getAllReceipts,
  getReceiptStats,
  searchReceipts,
  getMyReceipts,
  getReceiptsByStudent,
  getReceiptById,
  downloadReceiptPdf,
  recordManualPayment,
} from "../controllers/receiptController.js";
import { protectStaffAdmin } from "../middleware/authMiddleware.js";
import { protectPortal } from "../middleware/portalMiddleware.js";

const router = express.Router();

// ── Parent / Student portal — must come before /:id ──────────
router.get("/me", protectPortal, getMyReceipts);

// ── Admin only ────────────────────────────────────────────────
router.get("/stats",  protectStaffAdmin, getReceiptStats);
router.get("/search", protectStaffAdmin, searchReceipts);
router.get("/student/:studentId", protectStaffAdmin, getReceiptsByStudent);
router.post("/manual", protectStaffAdmin, recordManualPayment);
router.get("/", protectStaffAdmin, getAllReceipts);

// ── Receipt by Fee Statement ID (for portal users viewing receipts) ─
router.get("/byFeeStatement/:feeStatementId", protectPortal, async (req, res) => {
  try {
    const { feeStatementId } = req.params;
    const receipt = await (await import("../models/Receiptmodel.js")).default
      .findOne({ feeStatement: feeStatementId })
      .populate("student", "firstName lastName regNumber classLevel session parentEmail")
      .populate("issuedBy", "name")
      .populate("feeStatement", "reference dueDate items amountDue");

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found for this fee statement" });
    }

    // Verify student has access
    if (String(receipt.student._id) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Shared (admin OR portal — access control inside controller) ─
// Accepts either an admin/staff token or a portal token.
const protectAdminOrPortal = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  // Try portal first (cheap, no DB call needed to decode), fallback to staff admin
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    if (decoded.studentId) {
      req.studentId  = decoded.studentId;
      req.portalRole = decoded.role;
      return next();
    }
  } catch {
    // fall through to staff admin check
  }
  return protectStaffAdmin(req, res, next);
};

router.get("/:id",          protectAdminOrPortal, getReceiptById);
router.get("/download/:id", protectAdminOrPortal, downloadReceiptPdf);

export default router;