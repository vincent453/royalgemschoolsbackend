import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";

// ==========================================
// ADMIN AUTHENTICATION (Bearer token only)
// ==========================================

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin) {
      return res.status(401).json({ message: "Not authorized, admin not found" });
    }

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.admin) return next();
  return res.status(403).json({ message: "Access denied. Admin only." });
};

// ==========================================
// USER AUTHENTICATION (Bearer token only)
// ==========================================

export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    if (!req.user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ==========================================
// COMBINED AUTHENTICATION (Admin or User)
// ==========================================

export const protectAdminOrUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try admin first
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.userType = "admin";
      return next();
    }

    // Try user
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
      }
      req.user = user;
      req.userType = "user";
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

// Alias — some routes import protectAdmin separately
export const protectAdmin = protect;

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