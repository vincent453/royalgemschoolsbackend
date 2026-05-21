import express from "express";
router.post("/login", unifiedLogin);
import { unifiedLogin } from "../controllers/authController.js";

const router = express.Router();

// Single login endpoint for all staff (admin + teacher)
router.post("/login", unifiedLogin);

export default router;