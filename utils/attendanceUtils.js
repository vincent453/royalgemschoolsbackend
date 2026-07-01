// utils/attendanceUtils.js
// Helper functions for attendance calculations and reports

export const getAttendanceStats = (records) => {
  const stats = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  };

  records.forEach((record) => {
    switch (record.status) {
      case "present":
        stats.present++;
        break;
      case "absent":
        stats.absent++;
        break;
      case "late":
        stats.late++;
        break;
      case "excused":
        stats.excused++;
        break;
      default:
        break;
    }
  });

  // Calculate attendance percentage (present + late + excused are considered present)
  const presentCount = stats.present + stats.late + stats.excused;
  stats.percentage = stats.total > 0 ? Math.round((presentCount / stats.total) * 100) : 0;

  return stats;
};

export const getDateRange = (type) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let startDate, endDate;

  switch (type) {
    case "daily":
      startDate = new Date(now);
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);
      break;

    case "weekly":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;

    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;

    case "term":
      // Assuming term starts on first day of each 4-month period
      const termNumber = Math.floor(now.getMonth() / 4);
      startDate = new Date(now.getFullYear(), termNumber * 4, 1);
      endDate = new Date(now.getFullYear(), (termNumber + 1) * 4, 1);
      break;

    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;

    default:
      startDate = new Date(now);
      endDate = new Date(now);
  }

  return { startDate, endDate };
};

export const formatAttendanceReport = (data, reportType) => {
  return {
    reportType,
    generatedAt: new Date(),
    totalRecords: data.length,
    statistics: getAttendanceStats(data),
    data: data.map((record) => ({
      studentId: record.student?._id,
      studentName: `${record.student?.firstName} ${record.student?.lastName}`,
      classLevel: record.classLevel,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      recordedBy: record.recordedBy?.name || "Unknown",
    })),
  };
};

export const getDashboardStats = async (Attendance, Student, startDate, endDate, classLevel = null) => {
  const filter = {
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (classLevel) {
    filter.classLevel = classLevel;
  }

  const [presentCount, absentCount, lateCount, excusedCount, todayRecords, totalStudents] = await Promise.all([
    Attendance.countDocuments({ ...filter, status: "present" }),
    Attendance.countDocuments({ ...filter, status: "absent" }),
    Attendance.countDocuments({ ...filter, status: "late" }),
    Attendance.countDocuments({ ...filter, status: "excused" }),
    Attendance.find(filter).populate("student", "firstName lastName regNumber"),
    Student.countDocuments(classLevel ? { classLevel } : {}),
  ]);

  return {
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    totalStudents,
    attendancePercentage: totalStudents > 0 ? Math.round(((presentCount + lateCount + excusedCount) / totalStudents) * 100) : 0,
    todayRecords,
  };
};

export const validateAttendanceDate = (date) => {
  const attendanceDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  attendanceDate.setHours(0, 0, 0, 0);

  if (attendanceDate > today) {
    throw new Error("Cannot mark attendance for future dates");
  }

  return true;
};

export const getStudentAttendanceStats = (records) => {
  if (!records || records.length === 0) {
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      excusedDays: 0,
      attendancePercentage: 0,
      lastAttendance: null,
    };
  }

  const stats = getAttendanceStats(records);

  return {
    totalDays: stats.total,
    presentDays: stats.present,
    absentDays: stats.absent,
    lateDays: stats.late,
    excusedDays: stats.excused,
    attendancePercentage: stats.percentage,
    lastAttendance: records[records.length - 1]?.date || null,
  };
};
