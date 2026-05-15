import express from "express";
import {
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  createUser
} from "../controllers/userController.js";
import { protect} from "../middleware/authMiddleware.js";
const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================
router.post("/login", loginUser);

// ==========================================
// USER ROUTES (User authentication required)
// ==========================================
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changeUserPassword);

// ==========================================
// ADMIN ROUTES (Admin authentication required)
// ==========================================
router.post("/", protect, createUser);      // Admin creates users
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

router.post("/:id/delete", protect, deleteUser);      // NEW: POST method (like deactivate/activate)

// Deactivate and Activate
router.post("/:id/deactivate", protect, deactivateUser);
router.post("/:id/activate", protect, activateUser);

export default router;