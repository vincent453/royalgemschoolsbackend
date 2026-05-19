import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getEntries, getPublicEntries, createEntry,
  updateEntry, deleteEntry, uploadPhoto,
} from "../controllers/yearbookController.js";
 
const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });
 
// Public — no auth
router.get("/public", getPublicEntries);
 
// Admin — protected
router.get("/",              protect, getEntries);
router.post("/",             protect, createEntry);
router.patch("/:id",         protect, updateEntry);
router.delete("/:id",        protect, deleteEntry);
router.post("/upload",       protect, upload.single("photo"), uploadPhoto);
 
export default router;