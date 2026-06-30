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