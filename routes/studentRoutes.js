import express from "express";
import multer from "multer";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { protect, protectAdminOrUser, protectStudentOrPortal } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Admin + Teacher can view students
router.get("/", protectAdminOrUser, getStudents);
router.get("/:id", protectStudentOrPortal, getStudentById);

// 🔒 Admin only — add, edit, delete
router.post("/",    protect, upload.single("profilePhoto"), addStudent);
router.put("/:id",  protect, upload.single("profilePhoto"), updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;