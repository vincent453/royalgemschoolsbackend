import express from "express";
import {
  uploadResult,
  getStudentResult,
  renderResultCard,
  getAllResults,
} from "../controllers/resultController.js";
import { protect, protectAdminOrUser } from "../middleware/authMiddleware.js";
import Result from "../models/resultModel.js";
import { finalizeResult } from "../controllers/resultController.js";

const router = express.Router();

// ✅ Admin + Teacher can view all pending results ready to finalize
router.get("/pending", protectAdminOrUser, getPendingResults);

// ✅ Admin + Teacher can view all results
router.get("/", protectAdminOrUser, getAllResults);

// ✅ Admin + Teacher can upload results
router.post("/", protectAdminOrUser, uploadResult);

// ✅ Admin + Teacher can view result card (specific route BEFORE dynamic)
router.get("/card/:studentId", protectAdminOrUser, renderResultCard);

// ✅ Admin + Teacher can view single student result
router.get("/:studentId", protectAdminOrUser, getStudentResult);

// 🔒 Admin only — delete result
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    await Result.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Result deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete result: " + error.message,
    });
  }
});

// Class teacher finalizes a result from subject results
router.post("/finalize", protectAdminOrUser, finalizeResult);

export default router;