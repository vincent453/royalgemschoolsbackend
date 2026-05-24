import jwt from "jsonwebtoken";

// Middleware for routes that require a student/parent PIN token
export const protectPin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.studentId) {
      return res.status(401).json({ message: "Not authorized, invalid token type" });
    }

    req.studentId = decoded.studentId;
    req.role      = decoded.role; // "student" or "parent"
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}; 