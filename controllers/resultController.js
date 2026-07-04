import Result             from "../models/resultModel.js";
import Student            from "../models/studentModel.js";
import SubjectResult      from "../models/subjectResultModel.js";
import ClassSubjectConfig from "../models/classSubjectConfigModel.js";

const MAX_TOTAL = 90; // hwk(10) + ca1(10) + ca2(10) + exam(60)

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const computeGrade = (total) => {
  const pct = (total / MAX_TOTAL) * 100;
  if (pct >= 85) return { grade: "A", remark: "Excellent" };
  if (pct >= 70) return { grade: "B", remark: "V.Good"    };
  if (pct >= 60) return { grade: "C", remark: "Good"      };
  if (pct >= 50) return { grade: "D", remark: "Fair"      };
  if (pct >= 40) return { grade: "E", remark: "Poor"      };
  return              { grade: "F", remark: "Fail"      };
};

const computeGpa = (average) => {
  const pct = (average / MAX_TOTAL) * 100;
  if (pct >= 80) return 4.0;
  if (pct >= 70) return 3.5;
  if (pct >= 60) return 3.0;
  if (pct >= 50) return 2.0;
  if (pct >= 40) return 1.0;
  return 0.0;
};

async function recomputeClassAverage(classLevel, term, session) {
  const classResults = await Result.find({ term, session }).populate("student", "classLevel");
  const matching = classResults.filter(r => r.student?.classLevel === classLevel);
  if (matching.length === 0) return;

  const sum      = matching.reduce((acc, r) => acc + Number(r.average), 0);
  const classAvg = (sum / matching.length).toFixed(2);

  await Promise.all(
    matching.map(r => Result.findByIdAndUpdate(r._id, { classAverage: classAvg }))
  );
}

function convertNumberToWords(num) {
  const ones  = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const tens  = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];

  if (num === 0) return "Zero";
  let words = "";
  if (num >= 1000) { words += ones[Math.floor(num / 1000)] + " Thousand "; num %= 1000; }
  if (num >= 100)  { words += ones[Math.floor(num / 100)]  + " Hundred ";  num %= 100;  }
  if (num >= 20)   { words += tens[Math.floor(num / 10)]   + " "; num %= 10; }
  else if (num >= 10) { return (words + teens[num - 10]).trim(); }
  if (num > 0) words += ones[num] + " ";
  return words.trim();
}

// ─────────────────────────────────────────────────────────────
// UPLOAD RESULT (direct / legacy flow)
// ─────────────────────────────────────────────────────────────
export const uploadResult = async (req, res) => {
  try {
    const {
      studentId, term, session, subjects,
      timesSchoolOpened, timesPresent, numberOfStudentsInClass,
      affectiveDispositions, psychomotorDispositions, inclusiveLearningActivities,
      teacherRemark, headRemark, nextTermBegins,
    } = req.body;

    if (!studentId || !term || !session)
      return res.status(400).json({ message: "Student ID, term, and session are required" });
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0)
      return res.status(400).json({ message: "At least one subject is required" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existingResult = await Result.findOne({ student: studentId, term, session });
    if (existingResult)
      return res.status(400).json({
        message: `Result for ${term} (${session}) already exists. Use the update endpoint instead.`,
      });

    let totalScore = 0;
    const gradedSubjects = [];

    for (const s of subjects) {
      // cwk is no longer collected — only hwk, ca1, ca2, exam
      if (!s.name || s.hwk === undefined || s.ca1 === undefined || s.ca2 === undefined || s.exam === undefined)
        return res.status(400).json({ message: `Missing score fields for subject: ${s.name || "unknown"}` });

      if (Number(s.hwk)  < 0 || Number(s.hwk)  > 10) return res.status(400).json({ message: `HWK must be 0–10 for ${s.name}` });
      if (Number(s.ca1)  < 0 || Number(s.ca1)  > 10) return res.status(400).json({ message: `CA1 must be 0–10 for ${s.name}` });
      if (Number(s.ca2)  < 0 || Number(s.ca2)  > 10) return res.status(400).json({ message: `CA2 must be 0–10 for ${s.name}` });
      if (Number(s.exam) < 0 || Number(s.exam) > 60) return res.status(400).json({ message: `Exam must be 0–60 for ${s.name}` });

      const total          = Number(s.hwk) + Number(s.ca1) + Number(s.ca2) + Number(s.exam);
      const { grade, remark } = computeGrade(total);
      totalScore += total;

      gradedSubjects.push({
        name:  s.name,
        hwk:   Number(s.hwk),
        ca1:   Number(s.ca1),
        ca2:   Number(s.ca2),
        exam:  Number(s.exam),
        total,
        grade,
        remark,
      });
    }

    const average      = totalScore / subjects.length;
    const gpa          = computeGpa(average);
    const resultStatus = (average / MAX_TOTAL) * 100 >= 40 ? "Pass" : "Fail";

    // ── Carry-forward averages ────────────────────────────────
    let firstTermAverage  = null;
    let secondTermAverage = null;
    if (term === "2nd Term") {
      const t1 = await Result.findOne({ student: studentId, term: "1st Term", session });
      firstTermAverage = t1 ? Number(t1.average) : null;
    }
    if (term === "3rd Term") {
      const [t1, t2] = await Promise.all([
        Result.findOne({ student: studentId, term: "1st Term", session }),
        Result.findOne({ student: studentId, term: "2nd Term", session }),
      ]);
      firstTermAverage  = t1 ? Number(t1.average) : null;
      secondTermAverage = t2 ? Number(t2.average) : null;
    }

    const result = await Result.create({
      student: studentId,
      term,
      session,
      subjects: gradedSubjects,
      totalScore,
      average:      Number(average.toFixed(2)),
      classAverage: 0,
      gpa:          Number(gpa.toFixed(2)),
      resultStatus,
      firstTermAverage,
      secondTermAverage,
      timesSchoolOpened:           timesSchoolOpened       ?? 0,
      timesPresent:                timesPresent            ?? 0,
      numberOfStudentsInClass:     numberOfStudentsInClass ?? 0,
      affectiveDispositions:       affectiveDispositions       ?? [],
      psychomotorDispositions:     psychomotorDispositions     ?? [],
      inclusiveLearningActivities: inclusiveLearningActivities ?? [],
      teacherRemark,
      headRemark,
      nextTermBegins,
    });

    await recomputeClassAverage(student.classLevel, term, session);
    const updatedResult = await Result.findById(result._id);
    res.status(201).json({ message: "Result uploaded successfully", result: updatedResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FINALIZE RESULT (aggregated flow — from subject teacher uploads)
// ─────────────────────────────────────────────────────────────
export const finalizeResult = async (req, res) => {
  try {
    const {
      studentId, term, session,
      timesSchoolOpened, timesPresent, numberOfStudentsInClass,
      affectiveDispositions, psychomotorDispositions, inclusiveLearningActivities,
      teacherRemark, headRemark, nextTermBegins,
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existing = await Result.findOne({ student: studentId, term, session });
    if (existing)
      return res.status(400).json({ message: "Result already finalized. Use the update endpoint." });

    const subjectResults = await SubjectResult.find({ student: studentId, term, session });
    if (!subjectResults.length)
      return res.status(400).json({
        message: "No subject results found. Subject teachers must upload scores first.",
      });

    // Check required subjects
    const config = await ClassSubjectConfig.findOne({
      classLevel: student.classLevel,
      term,
      session,
    });

    if (config?.requiredSubjects?.length) {
      const uploadedSubjects = subjectResults.map((r) => r.subject);
      const missing = config.requiredSubjects.filter((s) => !uploadedSubjects.includes(s));
      if (missing.length > 0) {
        return res.status(400).json({
          message:         `Cannot finalize. Missing subjects: ${missing.join(", ")}`,
          missingSubjects: missing,
          uploadedSubjects,
        });
      }
    }

    // ── Carry-forward averages ────────────────────────────────
    let firstTermAverage  = null;
    let secondTermAverage = null;
    if (term === "2nd Term") {
      const t1 = await Result.findOne({ student: studentId, term: "1st Term", session });
      firstTermAverage = t1 ? Number(t1.average) : null;
    }
    if (term === "3rd Term") {
      const [t1, t2] = await Promise.all([
        Result.findOne({ student: studentId, term: "1st Term", session }),
        Result.findOne({ student: studentId, term: "2nd Term", session }),
      ]);
      firstTermAverage  = t1 ? Number(t1.average) : null;
      secondTermAverage = t2 ? Number(t2.average) : null;
    }

    // ── Build subjects array ──────────────────────────────────
    const subjects = subjectResults.map((sr) => ({
      name:              sr.subject,
      hwk:               sr.hwk,
      ca1:               sr.ca1,
      ca2:               sr.ca2,
      exam:              sr.exam,
      total:             sr.total,
      grade:             sr.grade,
      remark:            sr.remark,
      firstTermAverage:  sr.firstTermAverage  ?? null,
      secondTermAverage: sr.secondTermAverage ?? null,
    }));

    const totalScore   = subjects.reduce((sum, s) => sum + s.total, 0);
    const average      = totalScore / subjects.length;
    const gpa          = computeGpa(average);
    const resultStatus = (average / MAX_TOTAL) * 100 >= 40 ? "Pass" : "Fail";

    const result = await Result.create({
      student: studentId,
      term,
      session,
      subjects,
      totalScore,
      average:      Number(average.toFixed(2)),
      classAverage: 0,
      gpa:          Number(gpa.toFixed(2)),
      resultStatus,
      source:       "aggregated",
      firstTermAverage,
      secondTermAverage,
      timesSchoolOpened:           timesSchoolOpened       ?? 0,
      timesPresent:                timesPresent            ?? 0,
      numberOfStudentsInClass:     numberOfStudentsInClass ?? 0,
      affectiveDispositions:       affectiveDispositions       ?? [],
      psychomotorDispositions:     psychomotorDispositions     ?? [],
      inclusiveLearningActivities: inclusiveLearningActivities ?? [],
      teacherRemark,
      headRemark,
      nextTermBegins,
    });

    await recomputeClassAverage(student.classLevel, term, session);
    const updated = await Result.findById(result._id);
    res.status(201).json({ message: "Result finalized successfully", result: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET STUDENT RESULT (JSON)
// ─────────────────────────────────────────────────────────────
export const getStudentResult = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, session } = req.query;

    const query = { student: studentId };
    if (term)    query.term    = term;
    if (session) query.session = session;

    const result = await Result.findOne(query).populate("student");
    if (!result) return res.status(404).json({ message: "No result found" });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ALL RESULTS (JSON)
// ─────────────────────────────────────────────────────────────
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("student", "firstName lastName classLevel profilePhoto regNumber gender dateOfBirth age")
      .sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PENDING RESULTS
// ─────────────────────────────────────────────────────────────
export const getPendingResults = async (req, res) => {
  try {
    let classFilter = {};
    if (req.user && ["teacher", "subject_teacher", "class_teacher"].includes(req.user.role)) {
      const assignedClasses = new Set();
      if (req.user.assignedClass) assignedClasses.add(req.user.assignedClass);
      if (Array.isArray(req.user.assignedClasses)) {
        req.user.assignedClasses.forEach((cls) => { if (cls) assignedClasses.add(cls); });
      }
      if (assignedClasses.size === 0) return res.status(200).json([]);
      classFilter.classLevel = { $in: Array.from(assignedClasses) };
    }

    const subjectResults = await SubjectResult.find(classFilter)
      .populate("student", "firstName lastName regNumber profilePhoto classLevel");

    const grouped = new Map();
    subjectResults.forEach((result) => {
      if (!result.student) return;
      const key      = `${result.student._id}-${result.term}-${result.session}-${result.classLevel}`;
      const existing = grouped.get(key);
      if (existing) {
        if (!existing.subjects.includes(result.subject)) existing.subjects.push(result.subject);
        existing.subjectCount += 1;
      } else {
        grouped.set(key, {
          student:      result.student,
          term:         result.term,
          session:      result.session,
          classLevel:   result.classLevel,
          subjectCount: 1,
          subjects:     [result.subject],
        });
      }
    });

    const combos = Array.from(grouped.values());
    if (combos.length === 0) return res.json([]);

    const existingResults = await Result.find({
      $or: combos.map((item) => ({
        student: item.student._id,
        term:    item.term,
        session: item.session,
      })),
    }).select("student term session");

    const existingSet = new Set(
      existingResults.map((r) => `${r.student.toString()}-${r.term}-${r.session}`)
    );

    const pending = combos.filter(
      (item) => !existingSet.has(`${item.student._id}-${item.term}-${item.session}`)
    );

    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// RENDER EJS REPORT CARD
// ─────────────────────────────────────────────────────────────
export const renderResultCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, session } = req.query;

    const query = { student: studentId };
    if (term)    query.term    = term;
    if (session) query.session = session;

    const result = await Result.findOne(query).populate("student");
    if (!result) return res.status(404).render("error", { message: "No result found" });

    const maxMarks     = result.subjects.length * MAX_TOTAL;
    const totalInWords = convertNumberToWords(result.totalScore);

    const reportData = {
      student: {
        name:                    `${result.student.firstName} ${result.student.lastName}`,
        admissionNo:             result.student.regNumber,
        class:                   result.student.classLevel,
        gender:                  result.student.gender,
        session:                 result.student.session,
        photo:                   result.student.profilePhoto || null,
        age:                     result.student.age          || null,
        numberOfStudentsInClass: result.numberOfStudentsInClass,
      },
      term:     result.term,
      session:  result.session,
      subjects: result.subjects,
      attendance: {
        timesSchoolOpened: result.timesSchoolOpened,
        timesPresent:      result.timesPresent,
      },
      summary: {
        grandTotal:        result.totalScore,
        maxMarks,
        average:           result.average,
        classAverage:      result.classAverage,
        gpa:               result.gpa,
        totalInWords,
        resultStatus:      result.resultStatus,
        // carry-forward averages for report card display
        firstTermAverage:  result.firstTermAverage  ?? null,
        secondTermAverage: result.secondTermAverage ?? null,
      },
      dispositions: {
        affective:   result.affectiveDispositions,
        psychomotor: result.psychomotorDispositions,
        inclusive:   result.inclusiveLearningActivities,
      },
      remarks: {
        teacher:      result.teacherRemark || "",
        headOfSchool: result.headRemark    || "",
      },
      nextTermBegins: result.nextTermBegins || "",
      gradingScale: [
        { grade: "A", range: "85 – 100%", remark: "Excellent" },
        { grade: "B", range: "70 – 84%",  remark: "V.Good"    },
        { grade: "C", range: "60 – 69%",  remark: "Good"      },
        { grade: "D", range: "50 – 59%",  remark: "Fair"      },
        { grade: "E", range: "40 – 49%",  remark: "Poor"      },
        { grade: "F", range: "0 – 39%",   remark: "Fail"      },
      ],
    };

    res.render("reportCard", reportData);
  } catch (err) {
    res.status(500).render("error", { message: "Error loading report card" });
  }
};

// ─────────────────────────────────────────────────────────────
// VIEW ALL RESULTS (EJS admin table)
// ─────────────────────────────────────────────────────────────
export const viewAllResults = async (req, res) => {
  try {
    const results = await Result.find().populate("student").sort({ createdAt: -1 });
    const validResults = results.filter(r => r.student);

    const formattedResults = validResults.map(result => ({
      student: {
        _id:          result.student._id,
        name:         `${result.student.firstName} ${result.student.lastName}`,
        classLevel:   result.student.classLevel,
        profilePhoto: result.student.profilePhoto,
      },
      term:         result.term,
      session:      result.session,
      totalScore:   result.totalScore,
      average:      result.average,
      classAverage: result.classAverage,
      gpa:          result.gpa,
      resultStatus: result.resultStatus,
      subjects:     result.subjects,
    }));

    return res.render("admin/view-results", {
      title:      "View Results",
      admin:      req.admin || null,
      adminToken: null,
      results:    formattedResults,
    });
  } catch (error) {
    console.error("❌ View All Results Error:", error);
    return res.render("admin/view-results", {
      title: "View Results", admin: null, adminToken: null, results: [],
    });
  }
};