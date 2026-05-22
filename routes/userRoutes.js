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
  createUser,
} from "../controllers/userController.js";
import { protect, protectAdminOrUser, protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================
router.post("/login", loginUser);

// ==========================================
// USER ROUTES — teacher can access their own profile
// ==========================================
router.get("/profile",          protectUser, getUserProfile);
router.put("/profile",          protectUser, updateUserProfile);
router.put("/change-password",  protectUser, changeUserPassword);

// ==========================================
// ADMIN ONLY — manage all users
// ==========================================
router.post("/",   protect, createUser);
router.get("/",    protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id",       protect, deleteUser);
router.post("/:id/delete",  protect, deleteUser);
router.post("/:id/deactivate", protect, deactivateUser);
router.post("/:id/activate",   protect, activateUser);

export default router;