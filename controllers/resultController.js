import Result from "../models/resultModel.js";
import Student from "../models/studentModel.js";

// ─────────────────────────────────────────────────────────────
// UPLOAD RESULT
// ─────────────────────────────────────────────────────────────
export const uploadResult = async (req, res) => {
  try {
    const {
      studentId,
      term,
      session,
      subjects,
      classAverage,
      timesSchoolOpened,
      timesPresent,
      numberOfStudentsInClass,
      affectiveDispositions,
      psychomotorDispositions,
      inclusiveLearningActivities,
      teacherRemark,
      headRemark,
      nextTermBegins,
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
        message: `Result for ${term} (${session}) already exists for this student. Use the update endpoint instead.`,
      });

    let totalScore = 0;
    const gradedSubjects = [];

    for (const s of subjects) {
      if (!s.name || s.cwk === undefined || s.hwk === undefined || s.ca1 === undefined || s.ca2 === undefined || s.exam === undefined)
        return res.status(400).json({ message: `Missing score fields for subject: ${s.name || "unknown"}` });

      if (Number(s.cwk)  < 0 || Number(s.cwk)  > 10) return res.status(400).json({ message: `CWK must be 0–10 for ${s.name}` });
      if (Number(s.hwk)  < 0 || Number(s.hwk)  > 10) return res.status(400).json({ message: `HWK must be 0–10 for ${s.name}` });
      if (Number(s.ca1) < 0 || Number(s.ca1) > 10)   return res.status(400).json({ message: `CA1 must be 0–10 for ${s.name}` });
      if (Number(s.ca2) < 0 || Number(s.ca2) > 10)   return res.status(400).json({ message: `CA2 must be 0–10 for ${s.name}` });
      if (Number(s.exam) < 0 || Number(s.exam) > 60)  return res.status(400).json({ message: `Exam must be 0–60 for ${s.name}` });

      const total = Number(s.cwk) + Number(s.hwk) + Number(s.ca1) + Number(s.ca2) + Number(s.exam);
      let grade, remark;

      if (total >= 85)      { grade = "A"; remark = "Excellent"; }
      else if (total >= 70) { grade = "B"; remark = "V.Good"; }
      else if (total >= 60) { grade = "C"; remark = "Good"; }
      else if (total >= 50) { grade = "D"; remark = "Fair"; }
      else if (total >= 40) { grade = "E"; remark = "Poor"; }
      else                  { grade = "F"; remark = "Fail"; }
      totalScore += total;
      gradedSubjects.push({ name: s.name, cwk: Number(s.cwk), hwk: Number(s.hwk), ca1: Number(s.ca1), ca2: Number(s.ca2), exam: Number(s.exam), total, grade, remark });
    }

    const average = totalScore / subjects.length;

    const gpa = (() => {
      if (average >= 80) return 4.0;
      if (average >= 70) return 3.5;
      if (average >= 60) return 3.0;
      if (average >= 50) return 2.0;
      if (average >= 40) return 1.0;
      return 0.0;
    })();

    const resultStatus = average >= 40 ? "Pass" : "Fail";

    const result = await Result.create({
      student: studentId,
      term,
      session,
      subjects: gradedSubjects,
      totalScore,
      average: average.toFixed(2),
      classAverage: 0,
      gpa: gpa.toFixed(2),
      resultStatus,
      timesSchoolOpened:       timesSchoolOpened       ?? 0,
      timesPresent:            timesPresent            ?? 0,
      numberOfStudentsInClass: numberOfStudentsInClass  ?? 0,
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

    const maxMarks     = result.subjects.length * 100;
    const totalInWords = convertNumberToWords(result.totalScore);

    const reportData = {
      student: {
        name:         result.student.name,
        admissionNo:  result.student.regNumber,
        class:        result.student.classLevel,
        gender:       result.student.gender,
        session:      result.student.session,
        photo:        result.student.profilePhoto || null,
        age:          result.student.age || null,
        numberOfStudentsInClass: result.numberOfStudentsInClass,
      },
      term:    result.term,
      session: result.session,
      subjects: result.subjects,
      attendance: {
        timesSchoolOpened: result.timesSchoolOpened,
        timesPresent:      result.timesPresent,
      },
      summary: {
        grandTotal:   result.totalScore,
        maxMarks,
        average:      result.average,
        classAverage: result.classAverage,
        gpa:          result.gpa,
        totalInWords,
        resultStatus: result.resultStatus,
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
      { grade: "A", range: "85 – 100", remark: "Excellent" },
      { grade: "B", range: "70 – 84",  remark: "V.Good"    },
      { grade: "C", range: "60 – 69",  remark: "Good"      },
      { grade: "D", range: "50 – 59",  remark: "Fair"      },
      { grade: "E", range: "40 – 49",  remark: "Poor"      },
      { grade: "F", range: "0 – 39",   remark: "Fail"      },
    ]
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
    const results = await Result.find()
      .populate("student")
      .sort({ createdAt: -1 });

    const validResults = results.filter(r => r.student);

    const formattedResults = validResults.map(result => ({
      student: {
        _id:          result.student._id,
        name:         result.student.name,
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

    // NOTE: req.session removed — admin is set by JWT middleware on req.admin
    return res.render("admin/view-results", {
      title:      "View Results",
      admin:      req.admin || null,
      adminToken: null, // token lives on the client, not the server
      results:    formattedResults,
    });
  } catch (error) {
    console.error("❌ View All Results Error:", error);
    return res.render("admin/view-results", {
      title: "View Results", admin: null, adminToken: null, results: [],
    });
  }
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function recomputeClassAverage(classLevel, term, session) {
  const classResults = await Result.find({ term, session }).populate("student", "classLevel");
  const matching = classResults.filter(r => r.student?.classLevel === classLevel);
  if (matching.length === 0) return;

  const sum = matching.reduce((acc, r) => acc + Number(r.average), 0);
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