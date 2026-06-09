import express from "express";
import { protect, protectStaffAdmin, protectTeacher } from "../middleware/authMiddleware.js";
import {
  createAssignment, getAllAssignments,
  getMyAssignments, deleteAssignment,
} from "../controllers/subjectAssignmentController.js";

const router = express.Router();

router.get("/my",  protectTeacher, getMyAssignments);       // subject teacher
router.get("/",    protectStaffAdmin, getAllAssignments);    // admin
router.post("/",   protectStaffAdmin, createAssignment);    // admin
router.delete("/:id", protect, deleteAssignment);           // super admin only

export default router;