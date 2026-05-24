import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────────
// protectPortal
// Verifies the short-lived portal JWT (issued on student/parent login)
// Sets req.studentId and req.portalRole on the request
// ─────────────────────────────────────────────────────────────
export const protectPortal = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorised. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.studentId || !decoded.role) {
      return res.status(401).json({ message: "Invalid portal token." });
    }

    req.studentId  = decoded.studentId;
    req.portalRole = decoded.role; // "student" or "parent"
    next();
  } catch {
    return res.status(401).json({ message: "Token expired or invalid. Please log in again." });
  }
};


