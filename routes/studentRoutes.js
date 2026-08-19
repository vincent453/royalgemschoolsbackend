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

// Super Admin + Admin + teaching staff
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

// Super Admin + active users
router.get(
  "/:id",
  protectStudentOrPortal,
  getStudentById
);

// Super Admin + Admin
router.post(
  "/",
  protectStaffAdmin,
  upload.single("profilePhoto"),
  addStudent
);

router.put(
  "/:id",
  protectStaffAdmin,
  upload.single("profilePhoto"),
  updateStudent
);

router.delete(
  "/:id",
  protectStaffAdmin,
  deleteStudent
);

export default router;