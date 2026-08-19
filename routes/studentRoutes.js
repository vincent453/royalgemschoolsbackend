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

// Super Admin + Admin + Teaching staff
router.get(
  "/",
  protectAdminOrUser,
  restrictTo("admin", "teacher", "subject_teacher", "class_teacher"),
  getStudents
);

// Authenticated portal/staff access,
// with the controller/middleware responsible for
// determining whether the user can access this particular student.
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