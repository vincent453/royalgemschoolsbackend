import express from "express";
import multer from "multer";

import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

import {
  protectAdminOrUser,
  protectStaffAdmin,
  protectStudentOrPortal,
  restrictTo,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Super Admin + Admin + teaching staff can view students
router.get(
  "/",
  protectAdminOrUser,
  restrictTo(
    "admin",
    "teacher",
    "subject_teacher",
    "class_teacher"
  ),
  getStudents
);

// Authenticated users can reach this route.
// Controller should verify ownership/access.
router.get(
  "/:id",
  protectStudentOrPortal,
  getStudentById
);

// Super Admin + Admin can add students
router.post(
  "/",
  protectStaffAdmin,
  upload.single("profilePhoto"),
  addStudent
);

// Super Admin + Admin can edit students
router.put(
  "/:id",
  protectStaffAdmin,
  upload.single("profilePhoto"),
  updateStudent
);

// Super Admin + Admin can delete students
router.delete(
  "/:id",
  protectStaffAdmin,
  deleteStudent
);

export default router;