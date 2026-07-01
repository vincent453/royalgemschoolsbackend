// controllers/attendanceController.js
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import {
  recordAttendance,
  bulkRecordAttendance,
  getAttendanceRecords,
  getStudentAttendanceHistory,
  getTodayAttendanceSummary,
  getPendingAttendance,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from "../services/attendanceService.js";
import {
  getAttendanceStats,
  getDateRange,
  formatAttendanceReport,
  getDashboardStats,
  validateAttendanceDate,
} from "../utils/attendanceUtils.js";

// ─── POST /api/attendance ────────────────────────────────
// Record attendance for a single student
export const createAttendance = async (req, res) => {
  try {
    const { studentId, date, status, term, session, classLevel, remarks } = req.body;

    if (!studentId || !date || !status || !term) {
      return res.status(400).json({
        message: "studentId, date, status, and term are required",
      });
    }

    const recordedBy = req.admin?._id || req.user?._id;
    if (!recordedBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attendance = await recordAttendance({
      studentId,
      date,
      status,
      term,
      session,
      classLevel,
      remarks: remarks || "",
      recordedBy,
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ─── POST /api/attendance/bulk ────────────────────────────
// Bulk record attendance for multiple students
export const bulkCreateAttendance = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "records array is required" });
    }

    const recordedBy = req.admin?._id || req.user?._id;
    if (!recordedBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ensure all records have term
    const recordsWithTerm = records.map((r) => ({
      ...r,
      term: r.term || req.body.term,
    }));

    const result = await bulkRecordAttendance(recordsWithTerm, recordedBy);

    res.status(201).json({
      message: `Successfully recorded ${result.success.length} attendance records`,
      success: result.success,
      errors: result.errors,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ─── PUT /api/attendance/:id ────────────────────────────────
// Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const recordedBy = req.admin?._id || req.user?._id;

    const attendance = await updateAttendanceRecord(id, {
      status,
      remarks,
      recordedBy,
    });

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ─── DELETE /api/attendance/:id ────────────────────────────
// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAttendanceRecord(id);
    res.json({ success: true, message: "Attendance record deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ─── GET /api/attendance ────────────────────────────────────
// Get attendance records with pagination and filters
export const getAttendance = async (req, res) => {
  try {
    const {
      studentId,
      classLevel,
      status,
      startDate,
      endDate,
      session,
      term,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { records, total } = await getAttendanceRecords({
      studentId,
      classLevel,
      startDate,
      endDate,
      status,
      session,
      term,
      limit: parseInt(limit, 10),
      skip,
    });

    res.json({
      records,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/:id ────────────────────────────────
// Get single attendance record
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id)
      .populate("student", "firstName lastName regNumber classLevel")
      .populate("recordedBy", "name email");

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/student/:studentId ────────────────
// Get attendance history for a specific student
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, session } = req.query;

    const result = await getStudentAttendanceHistory(studentId, term, session);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/class/:classLevel ──────────────────
// Get attendance for entire class
export const getClassAttendance = async (req, res) => {
  try {
    const { classLevel } = req.params;
    const { date, session, term, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { records, total } = await getAttendanceRecords({
      classLevel,
      startDate: date,
      endDate: date,
      session,
      term,
      limit: parseInt(limit, 10),
      skip,
    });

    res.json({
      records,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/date/:date ───────────────────────
// Get all attendance for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { classLevel, session, term } = req.query;

    const { records, total } = await getAttendanceRecords({
      classLevel,
      startDate: date,
      endDate: date,
      session,
      term,
      limit: 1000,
    });

    const stats = getAttendanceStats(records);

    res.json({
      date,
      stats,
      records,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/me ───────────────────────────────
// Get attendance for logged-in student (parent portal)
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.studentId;
    if (!studentId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { term, session } = req.query;
    const result = await getStudentAttendanceHistory(studentId, term, session);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/dashboard/today ─────────────────
// Get today's attendance summary for dashboard
export const getTodayDashboard = async (req, res) => {
  try {
    const { classLevel } = req.query;

    const summary = await getTodayAttendanceSummary(classLevel);

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/dashboard/stats ─────────────────
// Get comprehensive dashboard statistics
export const getDashboardStats_api = async (req, res) => {
  try {
    const { classLevel, type = "daily" } = req.query;

    const { startDate, endDate } = getDateRange(type);

    const stats = await getDashboardStats(
      Attendance,
      Student,
      startDate,
      endDate,
      classLevel
    );

    res.json({
      period: type,
      startDate,
      endDate,
      classLevel: classLevel || "All Classes",
      ...stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/pending/:classLevel ─────────────
// Get students with pending attendance
export const getPendingAttendanceList = async (req, res) => {
  try {
    const { classLevel } = req.params;
    const { date } = req.query;

    const attendanceDate = date ? new Date(date) : new Date();

    const pending = await getPendingAttendance(classLevel, attendanceDate);

    res.json({
      date: attendanceDate,
      classLevel,
      pending,
      count: pending.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/attendance/report/generate ────────────────
// Generate attendance reports
export const generateAttendanceReport = async (req, res) => {
  try {
    const { reportType = "daily", classLevel, startDate, endDate } = req.query;

    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      const range = getDateRange(reportType);
      start = range.startDate;
      end = range.endDate;
    }

    const { records } = await getAttendanceRecords({
      classLevel,
      startDate: start,
      endDate: end,
      limit: 10000,
    });

    const report = formatAttendanceReport(records, reportType);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
