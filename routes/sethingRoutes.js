import express from "express";
import multer  from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSchoolInfo,
  getReportCardBranding,
  updateSchoolInfo,
  updateSchoolLogo,
  updateSchoolStampSignature,
  getAccount,
  updateAccount,
  changePassword,
  updateNotifications,
  updateAvatar
} from "../controllers/sethingsController.js";

const router = express.Router();

// ✅ Same memory storage pattern as studentRoutes.js
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

router.get("/school/report-card", getReportCardBranding);

// All settings routes require admin auth
router.use(protect);

// ── School Info ───────────────────────────────────────────────
router.get   ("/school",      getSchoolInfo);
router.patch ("/school",      updateSchoolInfo);
router.post  ("/school/logo", upload.single("logo"), updateSchoolLogo);
router.post(
  "/school/stamp-signature",
  upload.single("stampSignature"),
  updateSchoolStampSignature
);
router.post("/account/avatar", protect, upload.single("avatar"), updateAvatar);

// ── Account ───────────────────────────────────────────────────
router.get   ("/account",     getAccount);
router.patch ("/account",     updateAccount);

// ── Password ──────────────────────────────────────────────────
router.post  ("/password",    changePassword);

// ── Notifications ─────────────────────────────────────────────
router.patch ("/notifications", updateNotifications);


export default router;