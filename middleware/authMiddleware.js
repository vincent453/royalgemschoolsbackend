import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";

// ==========================================
// SUPER ADMIN — Admin collection only
// Use for: destructive actions, settings, delete ops
// ==========================================
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Not authorized, admin not found" });
    }

    req.admin = admin;
    req.isSuperAdmin = true;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ==========================================
// STAFF ADMIN — Admin collection OR User with role "admin"
// Use for: create/edit students, generate PINs, upload results,
//          manage teachers, yearbook, blog create/edit
// ==========================================
export const protectStaffAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Check Admin collection first (super admin)
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.isSuperAdmin = true;
      return next();
    }

    // 2. Check User collection for admin role
    const user = await User.findById(decoded.id).select("-password");
    if (user && user.role === "admin" && user.isActive) {
      req.user = user;
      req.admin = user;        // so controllers using req.admin still work
      req.isSuperAdmin = false;
      return next();
    }

    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ==========================================
// USER AUTH — teachers and user-admins
// ==========================================
export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ==========================================
// COMBINED — Super Admin, User-Admin, or Teacher
// Use for: read operations, upload results, view students
// ==========================================
export const protectAdminOrUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try super admin first
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.isSuperAdmin = true;
      req.userType = "admin";
      return next();
    }

    // Try user (teacher or user-admin)
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
      }
      req.user = user;
      req.isSuperAdmin = false;
      req.userType = "user";
      // Expose req.admin for controllers that check it for blog/pin authorship
      if (user.role === "admin") req.admin = user;
      return next();
    }

    return res.status(401).json({ message: "Not authorized, account not found" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Alias
export const protectAdmin = protect;
export const adminOnly = (req, res, next) => {
  if (req.admin) return next();
  return res.status(403).json({ message: "Access denied. Admin only." });
};

// ==========================================
// SUPER ADMIN ONLY GUARD (use after protectAdminOrUser)
// ==========================================
export const superAdminOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  return res.status(403).json({
    message: "Access denied. Only the Super Administrator can perform this action.",
  });
};

// ==========================================
// ROLE-BASED ACCESS CONTROL
// ==========================================
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: "Access denied" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }
    return next();
  };
};

// Public access — allows unauthenticated requests through
export const publicOrProtect = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protectAdminOrUser(req, res, next);
};

// Protects routes that subject teachers and class teachers can access
export const protectTeacher = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Allow super admin
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.isSuperAdmin = true;
      return next();
    }

    // Allow user-admin, subject_teacher, class_teacher, teacher
    const user = await User.findById(decoded.id).select("-password");
    if (user && user.isActive) {
      const allowed = ["admin", "subject_teacher", "class_teacher", "teacher"];
      if (!allowed.includes(user.role)) {
        return res.status(403).json({ message: "Access denied." });
      }
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "Not authorized." });
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Use after protectTeacher — ensures only subject teachers (or admins) pass
export const subjectTeacherOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  if (req.user?.role === "subject_teacher" || req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Access denied. Subject teachers only." });
};

// Use after protectTeacher — ensures only class teachers (or admins) pass
export const classTeacherOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  if (req.user?.role === "class_teacher" || req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Access denied. Class teachers only." });
};