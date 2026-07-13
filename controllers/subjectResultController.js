import SubjectResult    from "../models/subjectResultModel.js";
import SubjectAssignment from "../models/subjectAssignmentModel.js";
import Student          from "../models/studentModel.js";
import Result           from "../models/resultModel.js";

// ─────────────────────────────────────────────────────────────
// Score fields and max marks per term
// ─────────────────────────────────────────────────────────────
const TERM_FIELDS = {
  "1st Term": [
    { key: "hwk",  max: 10 },
    { key: "ca1",  max: 10 },
    { key: "ca2",  max: 10 },
    { key: "exam", max: 60 },
  ],
  "2nd Term": [
    { key: "hwk",  max: 10 },
    { key: "ca1",  max: 10 },
    { key: "ca2",  max: 10 },
    { key: "exam", max: 60 },
  ],
  "3rd Term": [
    { key: "hwk",  max: 10 },
    { key: "ca1",  max: 10 },
    { key: "ca2",  max: 10 },
    { key: "exam", max: 60 },
  ],
};

const MAX_TOTAL = 90; // hwk(10) + ca1(10) + ca2(10) + exam(60)

const gradeAndRemark = (total) => {
  // Grade based on percentage out of 90
  const pct = (total / MAX_TOTAL) * 100;
  if (pct >= 85) return { grade: "A", remark: "Excellent" };
  if (pct >= 70) return { grade: "B", remark: "V.Good"    };
  if (pct >= 60) return { grade: "C", remark: "Good"      };
  if (pct >= 50) return { grade: "D", remark: "Fair"      };
  if (pct >= 40) return { grade: "E", remark: "Poor"      };
  return              { grade: "F", remark: "Fail"      };
};

// ─────────────────────────────────────────────────────────────
// Helper — get a student's average from a previous term Result
// Returns null if not found
// ─────────────────────────────────────────────────────────────
const getPreviousTermAverage = async (studentId, term, session) => {
  const result = await Result.findOne({ student: studentId, term, session });
  return result ? Number(result.average) : null;
};

// ─────────────────────────────────────────────────────────────
// POST /api/subject-results
// ─────────────────────────────────────────────────────────────
export const uploadSubjectResult = async (req, res) => {
  try {
    const { studentId, subject, classLevel, term, session, hwk, ca1, ca2, exam } = req.body;
    const teacherId = req.user._id;

    if (!TERM_FIELDS[term]) {
      return res.status(400).json({ message: `Invalid term: ${term}` });
    }

    // Verify teacher assignment
const teacher = req.user;

const teacherSubjects = (teacher.subject || "")
  .split(",")
  .map(s => s.trim().toUpperCase());

const requestedSubject = subject.trim().toUpperCase();

const assignedClasses = (teacher.assignedClasses || [])
  .map(c => c.trim().toUpperCase());

const requestedClass = classLevel.trim().toUpperCase();

if (
  !req.isSuperAdmin &&
  (
    !teacherSubjects.includes(requestedSubject) ||
    !assignedClasses.includes(requestedClass)
  )
) {
  return res.status(403).json({
    message: "You are not assigned to teach this subject in this class.",
  });
}
    // Validate scores
    const scores = {
      hwk:  Number(hwk),
      ca1:  Number(ca1),
      ca2:  Number(ca2),
      exam: Number(exam),
    };

    if (scores.hwk  < 0 || scores.hwk  > 10) return res.status(400).json({ message: "HWK must be 0–10"  });
    if (scores.ca1  < 0 || scores.ca1  > 10) return res.status(400).json({ message: "CA1 must be 0–10"  });
    if (scores.ca2  < 0 || scores.ca2  > 10) return res.status(400).json({ message: "CA2 must be 0–10"  });
    if (scores.exam < 0 || scores.exam > 60) return res.status(400).json({ message: "Exam must be 0–60" });

    const total = scores.hwk + scores.ca1 + scores.ca2 + scores.exam;
    const { grade, remark } = gradeAndRemark(total);

    // ── Carry-forward averages ──────────────────────────────
    let firstTermAverage  = null;
    let secondTermAverage = null;

    if (term === "2nd Term") {
      firstTermAverage = await getPreviousTermAverage(studentId, "1st Term", session);
    }
    if (term === "3rd Term") {
      firstTermAverage  = await getPreviousTermAverage(studentId, "1st Term", session);
      secondTermAverage = await getPreviousTermAverage(studentId, "2nd Term", session);
    }

    const result = await SubjectResult.findOneAndUpdate(
      { student: studentId, subject, term, session },
      {
        ...scores,
        total,
        grade,
        remark,
        teacher:    teacherId,
        classLevel,
        status:     "submitted",
        firstTermAverage,
        secondTermAverage,
      },
      { upsert: true, new: true }
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/subject-results/class
// ─────────────────────────────────────────────────────────────
export const getClassSubjectResults = async (req, res) => {
  try {
    const { classLevel, subject, term, session } = req.query;

    const students = await Student.find({ classLevel }).select("_id firstName lastName regNumber");
    const studentIds = students.map((s) => s._id);

    const results = await SubjectResult.find({
      student: { $in: studentIds },
      subject,
      term,
      session,
    }).populate("student", "firstName lastName regNumber");

    const mapped = students.map((student) => {
      const result = results.find((r) => r.student._id.toString() === student._id.toString());
      return { student, result: result || null, uploaded: !!result };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/subject-results/student/:studentId
// ─────────────────────────────────────────────────────────────
export const getStudentSubjectResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, session } = req.query;

    const results = await SubjectResult.find({ student: studentId, term, session })
      .populate("teacher", "name");

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/subject-results/fields?term=1st+Term
// Returns which score fields apply for a given term
// Used by the frontend to render the correct input columns
// ─────────────────────────────────────────────────────────────
export const getTermFields = (req, res) => {
  const { term } = req.query;
  const fields = TERM_FIELDS[term];
  if (!fields) return res.status(400).json({ message: "Invalid term" });
  res.json({ term, fields, maxTotal: MAX_TOTAL });
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/subject-results/:id
// ─────────────────────────────────────────────────────────────
export const deleteSubjectResult = async (req, res) => {
  try {
    const result = await SubjectResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });

    if (!req.isSuperAdmin && result.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own uploads." });
    }

    await result.deleteOne();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};