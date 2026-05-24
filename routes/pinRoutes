import express from "express";
import {
  pinLogin,
  generatePins,
  getStudentsForPin,
  getStudentData,
} from "../controllers/pinController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — PIN login for student/parent
router.post("/login", pinLogin);

// Admin only — generate PINs
router.post("/generate", protect, generatePins);

// Admin only — get students for PIN dropdown
// Frontend calls: /api/pins/students?classLevel=JSS+1
router.get("/students", protect, getStudentsForPin);

// Student/Parent — get their own data
router.get("/student/:studentId", getStudentData);

export default router;