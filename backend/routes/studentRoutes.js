import express from "express";
import multer from "multer";
import {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Store in memory — no extra package needed
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.single("profilePhoto"), addStudent);
router.get("/", protect, getStudents);
router.put(
  "/:id",
  protect,
  upload.single("profilePhoto"),
  updateStudent
);
router.delete("/:id", protect, deleteStudent);

export default router;