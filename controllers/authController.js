import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Student from "../models/studentModel.js";
import Pin from "../models/pinModle.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================
// UNIFIED LOGIN — one endpoint, all roles
// POST /api/auth/login
//
// Staff  → send { email, password }
// Student/Parent → send { regNumber, pin, role: "student" | "parent" }
// ==========================================

export const unifiedLogin = async (req, res) => {
  try {
    const { email, password, regNumber, pin, role } = req.body;

    // ── BRANCH A: regNumber + PIN → student or parent ──────────────
    if (regNumber && pin) {
      // Find the student
      const student = await Student.findOne({
        regNumber: regNumber.trim().toUpperCase(),
      });
      if (!student) {
        return res.status(401).json({ message: "Invalid registration number or PIN" });
      }

      // Find a valid PIN
      const pinDoc = await Pin.findOne({
        pin: pin.trim(),
        $or: [
          { usedBy: student._id },       // already linked to this student
          { usedBy: null, isUsed: false }, // fresh unlinked PIN
        ],
      });

      if (!pinDoc) {
        return res.status(401).json({ message: "Invalid registration number or PIN" });
      }

      // Check expiry
      if (pinDoc.expiresAt && new Date() > pinDoc.expiresAt) {
        return res.status(401).json({
          message: "This PIN has expired. Please contact the school office.",
        });
      }

      // Link PIN to student on first use
      if (!pinDoc.usedBy) {
        pinDoc.usedBy = student._id;
        pinDoc.usedAt = new Date();
        pinDoc.isUsed = true;
        await pinDoc.save();
      }

      // role comes from the frontend tab ("student" or "parent")
      const portalRole = role === "parent" ? "parent" : "student";

      const token = jwt.sign(
        { studentId: student._id, role: portalRole },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token,
        role: portalRole,
        student: {
          _id:         student._id,
          firstName:   student.firstName,
          lastName:    student.lastName,
          regNumber:   student.regNumber,
          classLevel:  student.classLevel,
          session:     student.session,
          gender:      student.gender,
          profilePhoto: student.profilePhoto,
          parentFirstName: student.parentFirstName,
          parentLastName:  student.parentLastName,
          parentPhone:     student.parentPhone,
          parentEmail:     student.parentEmail,
        },
      });
    }

    // ── BRANCH B: email + password → admin or teacher ───────────────
    if (email && password) {
      // Check Admin collection first
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
          { id: admin._id, role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          message: "Login successful",
          token,
          role: "admin",
          user: {
            _id:   admin._id,
            name:  admin.name,
            email: admin.email,
            role:  "admin",
          },
        });
      }

      // Check User collection (teachers)
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive) {
          return res.status(403).json({ message: "Account is deactivated. Contact admin." });
        }

        if (user.role !== "teacher") {
          return res.status(403).json({ message: "Access denied. Staff portal only." });
        }

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          message: "Login successful",
          token,
          role: user.role,
          user: {
            _id:   user._id,
            name:  user.name,
            email: user.email,
            role:  user.role,
          },
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ── Neither branch matched ──────────────────────────────────────
    return res.status(400).json({
      message: "Please provide email & password, or registration number & PIN",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// REGISTER USER (Admin only)
// ==========================================

export const registerUser = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({
        message: "Access denied. Only admin can register new users.",
      });
    }

    const { name, email, password, role, studentId, phoneNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if ((role === "student" || role === "parent") && !studentId) {
      return res.status(400).json({
        message: `Student ID is required for ${role}s`,
      });
    }

    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      student: studentId || undefined,
      phoneNumber,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        student: user.student,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN-SPECIFIC ENDPOINTS (kept for existing routes)
// ==========================================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      role: "admin",
      admin: {
        _id:   admin._id,
        name:  admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logoutAdmin = async (req, res) => {
  res.json({
    message: "Logout successful",
    instructions: "Please delete the token from your client storage",
  });
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({
      _id:       admin._id,
      name:      admin.name,
      email:     admin.email,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.name = req.body.name || admin.name;

    if (req.body.email && req.body.email !== admin.email) {
      const emailExists = await Admin.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = req.body.email;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin: {
        _id:   updatedAdmin._id,
        name:  updatedAdmin.name,
        email: updatedAdmin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully. Please login again." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};