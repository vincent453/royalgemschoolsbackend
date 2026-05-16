// routes/settingsRoutes.js
// ─────────────────────────────────────────────────────────────
// Add ONE line to your app.js:
//
//   import settingsRoutes from "./routes/settingsRoutes.js";
//   app.use("/api/settings", settingsRoutes);
//
// Uses your existing protect middleware from authMiddleware.js
// Uses multer memoryStorage — same approach as studentRoutes.js
// ─────────────────────────────────────────────────────────────

import express from "express";
import multer  from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSchoolInfo,
  updateSchoolInfo,
  updateSchoolLogo,
  getAccount,
  updateAccount,
  changePassword,
  updateNotifications,
} from "../controllers/settingsController.js";

const router = express.Router();

// ✅ Same memory storage pattern as studentRoutes.js
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// All settings routes require admin auth
router.use(protect);

// ── School Info ───────────────────────────────────────────────
router.get   ("/school",      getSchoolInfo);
router.patch ("/school",      updateSchoolInfo);
router.post  ("/school/logo", upload.single("logo"), updateSchoolLogo);

// ── Account ───────────────────────────────────────────────────
router.get   ("/account",     getAccount);
router.patch ("/account",     updateAccount);

// ── Password ──────────────────────────────────────────────────
router.post  ("/password",    changePassword);

// ── Notifications ─────────────────────────────────────────────
router.patch ("/notifications", updateNotifications);

export default router;