import SubjectResult from "../models/subjectResultModel.js";
import SubjectAssignment from "../models/subjectAssignmentModel.js";
import Student from "../models/studentModel.js";

const gradeAndRemark = (total) => {
  if (total >= 85) return { grade: "A", remark: "Excellent" };
  if (total >= 70) return { grade: "B", remark: "V.Good" };
  if (total >= 60) return { grade: "C", remark: "Good" };
  if (total >= 50) return { grade: "D", remark: "Fair" };
  if (total >= 40) return { grade: "E", remark: "Poor" };
  return { grade: "F", remark: "Fail" };
};

// POST /api/subject-results
// Subject teacher uploads scores for their subject
export const uploadSubjectResult = async (req, res) => {
  try {
    const { studentId, subject, classLevel, term, session, cwk, hwk, ca1, ca2, exam } = req.body;
    const teacherId = req.user._id;

    if (req.user?.role === "class_teacher" && !req.isSuperAdmin) {
      return res.status(403).json({
        message: "Class teachers cannot upload subject scores.",
      });
    }

    // Verify teacher is assigned to this subject + class
    const assignment = await SubjectAssignment.findOne({
      teacher: teacherId,
      subject,
      classLevels: classLevel,
      session,
      isActive: true,
    });

    const normalize = (value) => String(value || "").trim().toLowerCase();
    const normalizedSubject = normalize(subject);
    const normalizedClass = normalize(classLevel);

    const profileSubjects = (req.user?.subject || "")
      .split(",")
      .map((s) => normalize(s))
      .filter(Boolean);

    const profileClasses = [
      ...(Array.isArray(req.user?.assignedClasses) ? req.user.assignedClasses : []),
      req.user?.assignedClass,
    ]
      .filter(Boolean)
      .map((c) => normalize(c));

    const profileMatch =
      profileSubjects.includes(normalizedSubject) &&
      profileClasses.includes(normalizedClass);

    if (!assignment && !req.isSuperAdmin && !profileMatch) {
      return res.status(403).json({
        message: "You are not assigned to teach this subject in this class.",
      });
    }

    // Validate scores
    const scores = { cwk: Number(cwk), hwk: Number(hwk), ca1: Number(ca1), ca2: Number(ca2), exam: Number(exam) };
    if (scores.cwk  < 0 || scores.cwk  > 10) return res.status(400).json({ message: "CWK must be 0–10" });
    if (scores.hwk  < 0 || scores.hwk  > 10) return res.status(400).json({ message: "HWK must be 0–10" });
    if (scores.ca1  < 0 || scores.ca1  > 10) return res.status(400).json({ message: "CA1 must be 0–10" });
    if (scores.ca2  < 0 || scores.ca2  > 10) return res.status(400).json({ message: "CA2 must be 0–10" });
    if (scores.exam < 0 || scores.exam > 60) return res.status(400).json({ message: "Exam must be 0–60" });

    const total = scores.cwk + scores.hwk + scores.ca1 + scores.ca2 + scores.exam;
    const { grade, remark } = gradeAndRemark(total);

    const result = await SubjectResult.findOneAndUpdate(
      { student: studentId, subject, term, session },
      { ...scores, total, grade, remark, teacher: teacherId, classLevel, status: "submitted" },
      { upsert: true, new: true }
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/subject-results/class?classLevel=JSS1&subject=Mathematics&term=1st Term&session=2024/2025
// Subject teacher views all results they uploaded for a class
export const getClassSubjectResults = async (req, res) => {
  try {
    const { classLevel, subject, term, session } = req.query;

    // Get all students in that class
    const students = await Student.find({ classLevel }).select("_id firstName lastName regNumber");
    const studentIds = students.map((s) => s._id);

    const results = await SubjectResult.find({
      student: { $in: studentIds },
      subject,
      term,
      session,
    }).populate("student", "firstName lastName regNumber");

    // Return students with their result (or null if not uploaded yet)
    const mapped = students.map((student) => {
      const result = results.find((r) => r.student._id.toString() === student._id.toString());
      return {
        student,
        result: result || null,
        uploaded: !!result,
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/subject-results/student/:studentId?term=&session=
// Class teacher fetches all subject results for a student (for finalization)
export const getStudentSubjectResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classLevel, term, session } = req.query;

    const results = await SubjectResult.find({
      student: studentId,
      classLevel,
      term,
      session,
    }).populate("teacher", "name");

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/subject-results/:id — teacher can delete their own upload
export const deleteSubjectResult = async (req, res) => {
  try {
    const result = await SubjectResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });

    // Only the teacher who uploaded or admin can delete
    if (!req.isSuperAdmin && result.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own uploads." });
    }

    await result.deleteOne();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};