import express from "express";
import {
  createScholarship,
  getScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
  previewAward,
  awardScholarship,
  getBeneficiaries,
  renewAssignment,
  cancelAssignment,
  getStudentScholarshipProfile,
  getReports,
} from "../controllers/scholarshipController.js";
import { protectStaffAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/reports", protectStaffAdmin, getReports);
router.get("/beneficiaries", protectStaffAdmin, getBeneficiaries);
router.get("/student/:id", protectStaffAdmin, getStudentScholarshipProfile);
router.post("/preview", protectStaffAdmin, previewAward);
router.post("/award", protectStaffAdmin, awardScholarship);
router.post("/renew/:id", protectStaffAdmin, renewAssignment);
router.post("/cancel/:id", protectStaffAdmin, cancelAssignment);
router.post("/", protectStaffAdmin, createScholarship);
router.get("/", protectStaffAdmin, getScholarships);
router.get("/:id", protectStaffAdmin, getScholarshipById);
router.put("/:id", protectStaffAdmin, updateScholarship);
router.delete("/:id", protectStaffAdmin, deleteScholarship);

export default router;
