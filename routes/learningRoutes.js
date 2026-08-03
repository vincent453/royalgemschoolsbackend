import express from "express";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  createSubmission,
  updateSubmission,
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/learningController.js";

const router = express.Router();

router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.put("/assignments/:id", updateAssignment);
router.delete("/assignments/:id", deleteAssignment);

router.get("/submissions", getSubmissions);
router.post("/submissions", createSubmission);
router.put("/submissions/:id", updateSubmission);

router.get("/resources", getResources);
router.post("/resources", createResource);
router.put("/resources/:id", updateResource);
router.delete("/resources/:id", deleteResource);

export default router;
