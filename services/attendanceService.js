// services/attendanceService.js
// Business logic for attendance operations

import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import {
  getAttendanceStats,
  validateAttendanceDate,
  getStudentAttendanceStats,
} from "../utils/attendanceUtils.js";

/**
 * Record or update attendance for a single student
 */
export const recordAttendance = async ({
  studentId,
  date,
  status,
  term,
  session,
  classLevel,
  remarks = "",
  recordedBy,
}) => {
  validateAttendanceDate(date);

  if (!["present", "absent", "late", "excused"].includes(status)) {
    throw new Error("Invalid attendance status");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  // Normalize date to start of day
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Check if attendance already exists for this date
  let attendance = await Attendance.findOne({
    student: studentId,
    date: attendanceDate,
    term,
  });

  if (attendance) {
    // Update existing record
    attendance.status = status;
    attendance.remarks = remarks;
    attendance.recordedBy = recordedBy;
    attendance.date = attendanceDate;
  } else {
    // Create new record
    attendance = new Attendance({
      student: studentId,
      classLevel: classLevel || student.classLevel,
      session: session || student.session,
      term,
      date: attendanceDate,
      status,
      remarks,
      recordedBy,
    });
  }

  await attendance.save();
  return attendance.populate("student", "firstName lastName regNumber");
};

/**
 * Bulk record attendance for a class
 */
export const bulkRecordAttendance = async (records, recordedBy) => {
  const results = [];
  const errors = [];

  for (const record of records) {
    try {
      const attendanceRecord = await recordAttendance({
        ...record,
        recordedBy,
      });
      results.push(attendanceRecord);
    } catch (err) {
      errors.push({
        studentId: record.studentId,
        error: err.message,
      });
    }
  }

  return { success: results, errors };
};

/**
 * Get attendance records with filters
 */
export const getAttendanceRecords = async ({
  studentId = null,
  classLevel = null,
  startDate = null,
  endDate = null,
  status = null,
  session = null,
  term = null,
  limit = 100,
  skip = 0,
}) => {
  const filter = {};

  if (studentId) filter.student = studentId;
  if (classLevel) filter.classLevel = classLevel;
  if (status) filter.status = status;
  if (session) filter.session = session;
  if (term) filter.term = term;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("student", "firstName lastName regNumber classLevel")
      .populate("recordedBy", "name email")
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip),
    Attendance.countDocuments(filter),
  ]);

  return { records, total, page: Math.floor(skip / limit) + 1 };
};

/**
 * Get student attendance history
 */
export const getStudentAttendanceHistory = async (studentId, term, session) => {
  const filter = {
    student: studentId,
  };

  if (term) filter.term = term;
  if (session) filter.session = session;

  const records = await Attendance.find(filter)
    .populate("student", "firstName lastName regNumber classLevel")
    .sort({ date: -1 });

  return {
    student: records[0]?.student || null,
    records,
    statistics: getStudentAttendanceStats(records),
  };
};

/**
 * Get today's attendance summary
 */
export const getTodayAttendanceSummary = async (classLevel = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter = {
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  };

  if (classLevel) {
    filter.classLevel = classLevel;
  }

  const records = await Attendance.find(filter)
    .populate("student", "firstName lastName regNumber classLevel")
    .populate("recordedBy", "name");

  const stats = getAttendanceStats(records);

  return {
    date: today,
    stats,
    records,
    pendingStudents: await getPendingAttendance(classLevel, today),
  };
};

/**
 * Get students who haven't had attendance marked
 */
export const getPendingAttendance = async (classLevel, date) => {
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const filter = classLevel ? { classLevel } : {};

  const [allStudents, markedStudents] = await Promise.all([
    Student.find(filter).select("_id firstName lastName regNumber classLevel"),
    Attendance.find({
      date: attendanceDate,
      ...(classLevel && { classLevel }),
    }).select("student"),
  ]);

  const markedStudentIds = markedStudents.map((a) => a.student.toString());
  const pending = allStudents.filter((s) => !markedStudentIds.includes(s._id.toString()));

  return pending;
};

/**
 * Delete attendance record
 */
export const deleteAttendanceRecord = async (attendanceId) => {
  const attendance = await Attendance.findByIdAndDelete(attendanceId);
  if (!attendance) {
    throw new Error("Attendance record not found");
  }
  return attendance;
};

/**
 * Update single attendance record
 */
export const updateAttendanceRecord = async (
  attendanceId,
  { status, remarks, recordedBy }
) => {
  const attendance = await Attendance.findByIdAndUpdate(
    attendanceId,
    { status, remarks, recordedBy },
    { new: true, runValidators: true }
  ).populate("student", "firstName lastName regNumber");

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  return attendance;
};
