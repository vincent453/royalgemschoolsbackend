import express from "express";
import { protectTeacher, protectAdminOrUser } from "../middleware/authMiddleware.js";
import {
  uploadSubjectResult,
  getClassSubjectResults,
  getStudentSubjectResults,
  deleteSubjectResult,
} from "../controllers/subjectResultController.js";

const router = express.Router();

router.post("/",                          protectTeacher, uploadSubjectResult);
router.get("/class",                      protectTeacher, getClassSubjectResults);
router.get("/student/:studentId",         protectAdminOrUser, getStudentSubjectResults);
router.delete("/:id",                     protectTeacher, deleteSubjectResult);

export default router;