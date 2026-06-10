import User from "../models/userModel.js";
import Student from "../models/studentModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    console.log("📥 Body received:", req.body);
    const {
      name, email, password, role, phoneNumber, isActive,
      subject, assignedClass, assignedClasses,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      subject:         subject         ?? "",
      assignedClass:   assignedClass   ?? "",
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      phoneNumber,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        role:            user.role,
        subject:         user.subject,
        assignedClass:   user.assignedClass,
        assignedClasses: user.assignedClasses,
        isActive:        user.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user — returns JWT token (Vercel-compatible, no sessions)
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    // Generate JWT — store this on the client (localStorage / httpOnly cookie)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      expiresIn: "7 days",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (User only)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("student", "name regNumber classLevel session");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      phoneNumber:    user.phoneNumber,
      subject:        user.subject        ?? "",
      assignedClass:  user.assignedClass  ?? "",
      assignedClasses:user.assignedClasses ?? [],
      student:        user.student,
      isActive:       user.isActive,
      lastLogin:      user.lastLogin,
      createdAt:      user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (User only)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = req.body.email;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private (User only)
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-password")
      .populate("student", "name regNumber classLevel")
      .sort({ createdAt: -1 });

    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("student", "name regNumber classLevel session");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
    if (req.body.student) user.student = req.body.student;

    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.deleteOne();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate user (Admin only)
// @route   PATCH /api/users/:id/deactivate
// @access  Private (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate user (Admin only)
// @route   PATCH /api/users/:id/activate
// @access  Private (Admin only)
export const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = true;
    await user.save();

    res.json({ success: true, message: "User activated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};