import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import User  from "../models/userModel.js";

// ─────────────────────────────────────────────────────────────
// Role groups — used by restrictTo() and route guards
// ─────────────────────────────────────────────────────────────
export const ROLES = {
  // Super Admin (Admin collection)
  SUPER_ADMIN: "super_admin",

  // Staff roles (User collection)
  ADMIN:             "admin",
  ACCOUNTANT:        "accountant",
  INVENTORY_MANAGER: "inventory_manager",
  TEACHER:           "teacher",
  SUBJECT_TEACHER:   "subject_teacher",
  CLASS_TEACHER:     "class_teacher",

  // Portal roles
  STUDENT: "student",
  PARENT:  "parent",
};

// Roles that have access to the staff/admin panel
export const STAFF_ROLES = [
  "admin", "accountant", "inventory_manager",
  "teacher", "subject_teacher", "class_teacher",
];

// Roles with any financial access
export const FINANCE_ROLES = ["admin", "accountant"];

// Roles with inventory access
export const INVENTORY_ROLES = ["admin", "inventory_manager"];

// Teaching roles
export const TEACHER_ROLES = ["admin", "teacher", "subject_teacher", "class_teacher"];

// ─────────────────────────────────────────────────────────────
// Internal: extract and verify JWT, resolve Admin or User
// Returns { admin, user, isSuperAdmin } or throws
// ─────────────────────────────────────────────────────────────
const resolveToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    const err = new Error("Not authorized, no token provided");
    err.status = 401;
    throw err;
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error(
      e.name === "TokenExpiredError" ? "Token expired, please login again" : "Not authorized, token failed"
    );
    err.status = 401;
    throw err;
  }

  // Try Admin collection first (super admin)
  const admin = await Admin.findById(decoded.id).select("-password");
  if (admin) return { admin, user: null, isSuperAdmin: true };

  // Try User collection
  const user = await User.findById(decoded.id).select("-password");
  if (user) return { admin: null, user, isSuperAdmin: false };

  const err = new Error("Not authorized, account not found");
  err.status = 401;
  throw err;
};

const sendUnauth = (res, err) =>
  res.status(err.status ?? 401).json({ message: err.message });

// ─────────────────────────────────────────────────────────────
// protect — Super Admin only (Admin collection)
// Use for: delete ops, system settings, user management
// ─────────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const { admin, isSuperAdmin } = await resolveToken(req);
    if (!admin || !isSuperAdmin) {
      return res.status(403).json({ message: "Access denied. Super Admin only." });
    }
    req.admin = admin;
    req.isSuperAdmin = true;
    next();
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectStaffAdmin — Super Admin OR user with role "admin"
// ─────────────────────────────────────────────────────────────
export const protectStaffAdmin = async (req, res, next) => {
  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin; req.isSuperAdmin = true;
      return next();
    }
    if (user && user.role === "admin" && user.isActive) {
      req.user = user; req.admin = user; req.isSuperAdmin = false;
      return next();
    }
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectAdminOrUser — Super Admin OR any active staff user
// Use for: read ops, dashboards, shared views
// ─────────────────────────────────────────────────────────────
export const protectAdminOrUser = async (req, res, next) => {
  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin; req.isSuperAdmin = true; req.userType = "admin";
      return next();
    }
    if (user && user.isActive) {
      req.user = user; req.isSuperAdmin = false; req.userType = "user";
      if (user.role === "admin") req.admin = user;
      return next();
    }
    if (user && !user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }
    return res.status(401).json({ message: "Not authorized." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectUser — any active User collection member
// ─────────────────────────────────────────────────────────────
export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user)          return res.status(401).json({ message: "Not authorized, user not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Super Admin, active staff, or the student/parent portal owner
export const protectStudentOrPortal = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: err.name === "TokenExpiredError"
        ? "Token expired, please login again"
        : "Not authorized, token failed",
    });
  }

  // Portal tokens carry studentId rather than a staff user id.
  if (decoded.studentId && ["student", "parent"].includes(decoded.role)) {
    req.studentId = decoded.studentId;
    req.portalRole = decoded.role;
    return next();
  }

  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin;
      req.isSuperAdmin = true;
      return next();
    }
    if (user?.isActive) {
      req.user = user;
      if (user.role === "admin") req.admin = user;
      return next();
    }
    return res.status(403).json({ message: "Access denied." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectTeacher — Super Admin OR any teaching role
// ─────────────────────────────────────────────────────────────
export const protectTeacher = async (req, res, next) => {
  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin; req.isSuperAdmin = true; return next();
    }
    if (user && user.isActive && TEACHER_ROLES.includes(user.role)) {
      req.user = user; return next();
    }
    return res.status(403).json({ message: "Access denied. Teaching staff only." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectFinance — Super Admin OR accountant OR admin
// ─────────────────────────────────────────────────────────────
export const protectFinance = async (req, res, next) => {
  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin; req.isSuperAdmin = true; return next();
    }
    if (user && user.isActive && FINANCE_ROLES.includes(user.role)) {
      req.user = user; if (user.role === "admin") req.admin = user; return next();
    }
    return res.status(403).json({ message: "Access denied. Finance staff only." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// protectInventory — Super Admin OR inventory_manager OR admin
// ─────────────────────────────────────────────────────────────
export const protectInventory = async (req, res, next) => {
  try {
    const { admin, user, isSuperAdmin } = await resolveToken(req);
    if (admin && isSuperAdmin) {
      req.admin = admin; req.isSuperAdmin = true; return next();
    }
    if (user && user.isActive && INVENTORY_ROLES.includes(user.role)) {
      req.user = user; if (user.role === "admin") req.admin = user; return next();
    }
    return res.status(403).json({ message: "Access denied. Inventory staff only." });
  } catch (err) {
    sendUnauth(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// restrictTo(...roles) — role-based guard, use after a protect
// ─────────────────────────────────────────────────────────────
export const restrictTo = (...roles) => (req, res, next) => {
  if (req.isSuperAdmin) return next(); // super admin bypasses all role checks
  const userRole = req.user?.role;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({
      message: `Access denied. Required roles: ${roles.join(", ")}`,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// Guard shortcuts (use after protectAdminOrUser or protectTeacher)
// ─────────────────────────────────────────────────────────────
export const superAdminOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  return res.status(403).json({ message: "Access denied. Only the Super Administrator can perform this action." });
};

export const subjectTeacherOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  if (["subject_teacher", "admin"].includes(req.user?.role)) return next();
  return res.status(403).json({ message: "Access denied. Subject teachers only." });
};

export const classTeacherOnly = (req, res, next) => {
  if (req.isSuperAdmin) return next();
  if (["class_teacher", "admin"].includes(req.user?.role)) return next();
  return res.status(403).json({ message: "Access denied. Class teachers only." });
};

export const adminOnly = (req, res, next) => {
  if (req.admin) return next();
  return res.status(403).json({ message: "Access denied. Admin only." });
};

export const publicOrProtect = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return protectAdminOrUser(req, res, next);
};

// Aliases for backward compatibility
export const protectAdmin = protect;