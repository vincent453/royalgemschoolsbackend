import express from "express";
import { protectTeacher, protectAdminOrUser, subjectTeacherOnly } from "../middleware/authMiddleware.js";
import {
  uploadSubjectResult,
  getClassSubjectResults,
  getStudentSubjectResults,
  deleteSubjectResult,
} from "../controllers/subjectResultController.js";

const router = express.Router();

router.post("/",                          protectTeacher, subjectTeacherOnly, uploadSubjectResult);
router.get("/class",                      protectTeacher, subjectTeacherOnly, getClassSubjectResults);
router.get("/student/:studentId",         protectAdminOrUser, getStudentSubjectResults);
router.delete("/:id",                     protectTeacher, subjectTeacherOnly, deleteSubjectResult);

export default router;