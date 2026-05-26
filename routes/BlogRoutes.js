import express from "express";
import multer from "multer";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/blogController.js";
import { protect, protectAdminOrUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Public ────────────────────────────────────────────────────
router.get("/",    getAllPosts);   // ?category=Education
router.get("/:id", getPostById);

// ── Admin or Teacher ──────────────────────────────────────────
router.post(  "/",    protectAdminOrUser, upload.single("image"), createPost);
router.patch( "/:id", protectAdminOrUser, upload.single("image"), updatePost);
router.delete("/:id", protectAdminOrUser, deletePost);

export default router;