// middleware/attendanceValidator.js
import { validateAttendanceDate } from "../utils/attendanceUtils.js";

export const validateAttendanceInput = (req, res, next) => {
  const { studentId, date, status, term } = req.body;

  if (!studentId || !date || !status || !term) {
    return res.status(400).json({
      message: "Missing required fields: studentId, date, status, term",
    });
  }

  const validStatuses = ["present", "absent", "late", "excused"];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    validateAttendanceDate(date);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

export const validateBulkAttendanceInput = (req, res, next) => {
  const { records, term } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      message: "records must be a non-empty array",
    });
  }

  const validStatuses = ["present", "absent", "late", "excused"];
  const errors = [];

  records.forEach((record, index) => {
    if (!record.studentId || !record.status) {
      errors.push(`Record ${index + 1}: Missing studentId or status`);
    }

    if (record.status && !validStatuses.includes(record.status.toLowerCase())) {
      errors.push(
        `Record ${index + 1}: Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    if (record.date) {
      try {
        validateAttendanceDate(record.date);
      } catch (err) {
        errors.push(`Record ${index + 1}: ${err.message}`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation errors in bulk attendance",
      errors,
    });
  }

  next();
};

export const checkAttendancePermissions = (req, res, next) => {
  const user = req.admin || req.user;

  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Only admins and teachers can modify attendance
  const allowedRoles = ["admin", "staff", "teacher"];
  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    return res.status(403).json({
      message: "Only admin/staff/teachers can manage attendance",
    });
  }

  next();
};
