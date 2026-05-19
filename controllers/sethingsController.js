// controllers/settingsController.js
// ─────────────────────────────────────────────────────────────
// Uses your existing:
//   models/sethingsModel.js  → Settings
//   models/adminModel.js     → Admin
//   config/cloudinary.js     → already configured in studentController
// ─────────────────────────────────────────────────────────────

import { v2 as cloudinary } from "cloudinary";
import Settings from "../models/sethingsModel.js";
import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────────────────────
// Helper — same Cloudinary upload pattern you use in studentController
// ─────────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "school_logos" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// Helper — get or create the single settings document
const getOrCreate = () =>
  Settings.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

// ─────────────────────────────────────────────────────────────
// GET /api/settings/school
// ─────────────────────────────────────────────────────────────
export const getSchoolInfo = async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/settings/school
// Updates text fields: schoolName, tagline, email, phone,
//                      address, address2, website, session, currentTerm
// ─────────────────────────────────────────────────────────────
export const updateSchoolInfo = async (req, res) => {
  try {
    const allowed = [
      "schoolName", "tagline", "email", "phone",
      "address", "address2", "website", "session", "currentTerm",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/settings/school/logo
// Receives file via multer memoryStorage (same as studentRoutes)
// Uploads to Cloudinary → saves URL in settings.logo
// ─────────────────────────────────────────────────────────────
export const updateSchoolLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { logo: result.secure_url } },
      { upsert: true, new: true }
    );

    res.json({ logoUrl: settings.logo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/settings/account
// Returns the logged-in admin's profile (req.admin set by protect)
// ─────────────────────────────────────────────────────────────
export const getAccount = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

   // In getAccount controller
res.json({
  adminName:  admin.name,
  adminEmail: admin.email,
  role:       admin.role,
  avatar:     admin.avatar?.trim() || null, // 👈 normalize "" to null
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/settings/account
// Updates admin name and/or email
// ─────────────────────────────────────────────────────────────
export const updateAccount = async (req, res) => {
  try {
    const { adminName, adminEmail } = req.body;

    if (!adminName?.trim() && !adminEmail?.trim()) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    // Check email is not already taken by another admin
    if (adminEmail?.trim()) {
      const taken = await Admin.findOne({
        email: adminEmail.trim().toLowerCase(),
        _id: { $ne: req.admin._id },
      });
      if (taken) return res.status(400).json({ message: "Email already in use" });
    }

    // Build update object
    const updates = {};
    if (adminName?.trim())  updates.name  = adminName.trim();
    if (adminEmail?.trim()) updates.email = adminEmail.trim().toLowerCase();

    // Use findByIdAndUpdate — bypasses pre-save hook so password is never touched
    const updated = await Admin.findByIdAndUpdate(
      req.admin._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Admin not found" });

    res.json({
      adminName:  updated.name,
      adminEmail: updated.email,
      role:       updated.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/settings/password
// Body: { currentPassword, newPassword }
// Mirrors your existing changePassword in authController
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // Must select +password — it is excluded by default
    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash manually + use findByIdAndUpdate to skip the broken pre-save next() hook
    const hashed = await bcrypt.hash(newPassword, 12);
    await Admin.findByIdAndUpdate(req.admin._id, { $set: { password: hashed } });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/settings/notifications
// Body: { resultUploaded, newStudent, newTeacher, systemAlert, emailNotif }
// ─────────────────────────────────────────────────────────────
export const updateNotifications = async (req, res) => {
  try {
    const allowed = ["resultUploaded", "newStudent", "newTeacher", "systemAlert", "emailNotif"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined)
        updates[`notifications.${key}`] = req.body[key];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No notification fields provided" });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true }
    );

    res.json(settings.notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};