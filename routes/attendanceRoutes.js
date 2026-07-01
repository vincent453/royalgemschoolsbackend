// routes/attendanceRoutes.js
import express from "express";
import {
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceByDate,
  getMyAttendance,
  getTodayDashboard,
  getDashboardStats_api,
  getPendingAttendanceList,
  generateAttendanceReport,
} from "../controllers/attendanceController.js";
import { protectStaffAdmin, protectStudentOrPortal } from "../middleware/authMiddleware.js";
import { protectPortal } from "../middleware/portalMiddleware.js";
import {
  validateAttendanceInput,
  validateBulkAttendanceInput,
  checkAttendancePermissions,
} from "../middleware/attendanceValidator.js";

const router = express.Router();

// ─── Dashboard & Reports (must come before /:id) ───────────
router.get("/dashboard/today", protectStaffAdmin, getTodayDashboard);
router.get("/dashboard/stats", protectStaffAdmin, getDashboardStats_api);
router.get("/report/generate", protectStaffAdmin, generateAttendanceReport);

// ─── Student/Parent Portal ───────────────────────────────
router.get("/me", protectPortal, getMyAttendance);

// ─── Admin/Staff CRUD ────────────────────────────────────
router.post(
  "/",
  protectStaffAdmin,
  checkAttendancePermissions,
  validateAttendanceInput,
  createAttendance
);

router.post(
  "/bulk",
  protectStaffAdmin,
  checkAttendancePermissions,
  validateBulkAttendanceInput,
  bulkCreateAttendance
);

router.put("/:id", protectStaffAdmin, checkAttendancePermissions, updateAttendance);
router.delete("/:id", protectStaffAdmin, checkAttendancePermissions, deleteAttendance);

// ─── Admin Queries ──────────────────────────────────────
router.get("/pending/:classLevel", protectStaffAdmin, getPendingAttendanceList);
router.get("/class/:classLevel", protectStaffAdmin, getClassAttendance);
router.get("/date/:date", protectStaffAdmin, getAttendanceByDate);
router.get("/student/:studentId", protectStaffAdmin, getStudentAttendance);
router.get("/", protectStaffAdmin, getAttendance);

// ─── Single Record (must come LAST) ──────────────────────
router.get("/:id", protectStaffAdmin, getAttendanceById);

export default router;
