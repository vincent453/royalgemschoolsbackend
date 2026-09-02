import express from "express";
import multer  from "multer";
import { protectStudentOrPortal, protectTeacher } from "../middleware/authMiddleware.js";
import { protectPortal }                      from "../middleware/portalMiddleware.js";
import {
  createAssignment, getAssignments, getAssignment,
  updateAssignment, deleteAssignment,
  getSubmissions, submitAssignment,
  getMyAssignments, getMyAssignment,
  getMySubmissions, getMySubmission,
  getSubmission, gradeSubmission,
  getResources, getResource, createResource, updateResource, deleteResource,
} from "../controllers/lmsController.js";

const router = express.Router();

// Multer — memory storage, same as rest of codebase
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg", "image/png", "image/webp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Allowed file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, WEBP"));
  },
});

// For resources: separate fields for image and attachment
const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg", "image/png", "image/webp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Allowed file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, WEBP"));
  },
});

// ── Student portal — My Assignments ──────────────────────────
router.get( "/my-assignments",      protectPortal, getMyAssignments);
router.get( "/my-assignments/:id",  protectPortal, getMyAssignment);
router.post("/assignments/:id/submit",
  protectPortal,
  upload.single("attachment"),
  submitAssignment
);
router.get("/my-submissions",       protectPortal, getMySubmissions);
router.get("/my-submissions/:id",   protectPortal, getMySubmission);

// ── Portal: Learning Resources (students can view) ────────────
router.get("/resources", protectStudentOrPortal, getResources);
router.get("/resources/:id", protectStudentOrPortal, getResource);

// ── Teacher / Admin — Assignments ─────────────────────────────
router.get( "/assignments",     protectTeacher, getAssignments);
router.post("/assignments",     protectTeacher, upload.single("attachment"), createAssignment);
router.get( "/assignments/:id", protectTeacher, getAssignment);
router.put( "/assignments/:id", protectTeacher, upload.single("attachment"), updateAssignment);
router.delete("/assignments/:id", protectTeacher, deleteAssignment);

// ── Teacher / Admin — Submissions & Grading ───────────────────
router.get(  "/assignments/:id/submissions", protectTeacher, getSubmissions);
router.get(  "/submissions/:id",             protectTeacher, getSubmission);
router.patch("/submissions/:id/grade",       protectTeacher, gradeSubmission);

// ── Teacher / Admin — Learning Resources ─────────────────────
router.post(  "/resources",     protectTeacher,
  resourceUpload.fields([{ name: "image", maxCount: 1 }, { name: "attachment", maxCount: 1 }]),
  createResource
);
router.put(   "/resources/:id", protectTeacher,
  resourceUpload.fields([{ name: "image", maxCount: 1 }, { name: "attachment", maxCount: 1 }]),
  updateResource
);
router.delete("/resources/:id", protectTeacher, deleteResource);

export default router;
