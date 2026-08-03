import Scholarship from "../models/scholarshipModel.js";
import ScholarshipAssignment from "../models/scholarshipAssignmentModel.js";
import ScholarshipHistory from "../models/scholarshipHistoryModel.js";
import Student from "../models/studentModel.js";
import FeeStatement from "../models/feeStatementModel.js";

const fmtDate = (value) => (value ? new Date(value) : null);

const calculateDiscount = (scholarship, originalFees) => {
  if (!scholarship) return { discountAmount: 0, remainingBalance: originalFees };
  if (scholarship.discountType === "percentage") {
    const pct = Number(scholarship.discountValue || 0) / 100;
    return {
      discountAmount: Number(originalFees || 0) * pct,
      remainingBalance: Number(originalFees || 0) - Number(originalFees || 0) * pct,
    };
  }
  return {
    discountAmount: Number(scholarship.discountValue || 0),
    remainingBalance: Math.max(0, Number(originalFees || 0) - Number(scholarship.discountValue || 0)),
  };
};

export const createScholarship = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.scholarshipName || !payload.scholarshipCode) {
      return res.status(400).json({ message: "Scholarship name and code are required" });
    }

    const scholarship = await Scholarship.create({
      ...payload,
      discountValue: Number(payload.discountValue || 0),
      maxBeneficiaries: payload.maxBeneficiaries ? Number(payload.maxBeneficiaries) : null,
      startDate: fmtDate(payload.startDate),
      endDate: fmtDate(payload.endDate),
      createdBy: req.admin?._id || req.user?._id,
    });

    await ScholarshipHistory.create({ scholarship: scholarship._id, action: "Created", reason: "Scholarship created", user: req.admin?._id || req.user?._id });
    res.status(201).json({ scholarship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScholarships = async (req, res) => {
  try {
    const { search = "", status, type, sponsor, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (sponsor) filter.sponsor = { $regex: sponsor, $options: "i" };

    if (search) {
      filter.$or = [
        { scholarshipName: { $regex: search, $options: "i" } },
        { scholarshipCode: { $regex: search, $options: "i" } },
        { sponsor: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [scholarships, total] = await Promise.all([
      Scholarship.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Scholarship.countDocuments(filter),
    ]);

    res.json({ scholarships, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });

    const beneficiaries = await ScholarshipAssignment.find({ scholarship: scholarship._id })
      .populate("student", "firstName lastName regNumber classLevel profilePhoto")
      .sort({ createdAt: -1 });

    const auditLog = await ScholarshipHistory.find({ scholarship: scholarship._id })
      .populate("student", "firstName lastName regNumber")
      .sort({ createdAt: -1 });

    res.json({ scholarship, beneficiaries, auditLog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });

    const payload = req.body;
    Object.assign(scholarship, payload, {
      discountValue: Number(payload.discountValue || scholarship.discountValue || 0),
      maxBeneficiaries: payload.maxBeneficiaries ? Number(payload.maxBeneficiaries) : null,
      startDate: payload.startDate ? fmtDate(payload.startDate) : scholarship.startDate,
      endDate: payload.endDate ? fmtDate(payload.endDate) : scholarship.endDate,
    });

    await scholarship.save();
    await ScholarshipHistory.create({ scholarship: scholarship._id, action: "Updated", reason: "Scholarship updated", user: req.admin?._id || req.user?._id });
    res.json({ scholarship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ message: "Scholarship not found" });
    await ScholarshipAssignment.deleteMany({ scholarship: req.params.id });
    await ScholarshipHistory.deleteMany({ scholarship: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const previewAward = async (req, res) => {
  try {
    const { studentId, scholarshipId } = req.body;
    if (!studentId || !scholarshipId) return res.status(400).json({ message: "studentId and scholarshipId are required" });

    const [student, scholarship] = await Promise.all([
      Student.findById(studentId),
      Scholarship.findById(scholarshipId),
    ]);

    if (!student || !scholarship) return res.status(404).json({ message: "Student or scholarship not found" });

    const feeStatement = await FeeStatement.findOne({ student: student._id }).sort({ createdAt: -1 });
    const originalFees = feeStatement?.amountDue || 0;
    const { discountAmount, remainingBalance } = calculateDiscount(scholarship, originalFees);

    res.json({ preview: { originalFees, discountAmount, remainingBalance }, feeStatement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const awardScholarship = async (req, res) => {
  try {
    const { studentId, scholarshipId, feeStatementId, effectiveDate, expiryDate, session, reason } = req.body;
    if (!studentId || !scholarshipId) return res.status(400).json({ message: "studentId and scholarshipId are required" });

    const [student, scholarship] = await Promise.all([
      Student.findById(studentId),
      Scholarship.findById(scholarshipId),
    ]);

    if (!student || !scholarship) return res.status(404).json({ message: "Student or scholarship not found" });

    const existing = await ScholarshipAssignment.findOne({ student: studentId, scholarship: scholarshipId, status: "Active" });
    if (existing) return res.status(400).json({ message: "Student already has an active scholarship for this program" });

    const feeStatement = feeStatementId ? await FeeStatement.findById(feeStatementId) : await FeeStatement.findOne({ student: student._id }).sort({ createdAt: -1 });
    const originalFees = feeStatement?.amountDue || 0;
    const { discountAmount, remainingBalance } = calculateDiscount(scholarship, originalFees);

    const assignment = await ScholarshipAssignment.create({
      student: student._id,
      scholarship: scholarship._id,
      feeStatement: feeStatement?._id,
      originalFees,
      discountAmount,
      remainingBalance,
      effectiveDate: effectiveDate ? fmtDate(effectiveDate) : new Date(),
      expiryDate: expiryDate ? fmtDate(expiryDate) : scholarship.endDate,
      session: session || scholarship.applicableSession || student.session || "",
      reason: reason || "Assigned by admin",
      awardedBy: req.admin?._id || req.user?._id,
    });

    scholarship.currentBeneficiaries = (scholarship.currentBeneficiaries || 0) + 1;
    await scholarship.save();

    await ScholarshipHistory.create({ scholarship: scholarship._id, assignment: assignment._id, student: student._id, action: "Awarded", reason: reason || "Scholarship awarded", user: req.admin?._id || req.user?._id });

    if (feeStatement) {
      feeStatement.balance = Math.max(0, (feeStatement.balance || feeStatement.amountDue) - discountAmount);
      feeStatement.amountPaid = (feeStatement.amountPaid || 0) + discountAmount;
      feeStatement.status = feeStatement.balance <= 0 ? "paid" : feeStatement.status;
      await feeStatement.save();
    }

    res.status(201).json({ assignment, scholarship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBeneficiaries = async (req, res) => {
  try {
    const { classLevel, scholarshipId, status, search, page = 1, limit = 20 } = req.query;
    const filter = { status: { $ne: "Cancelled" } };

    if (classLevel) filter["student.classLevel"] = classLevel;
    if (scholarshipId) filter.scholarship = scholarshipId;
    if (status) filter.status = status;

    if (search) {
      const students = await Student.find({ $or: [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }, { regNumber: { $regex: search, $options: "i" } }] }).select("_id");
      filter.student = { $in: students.map((s) => s._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [assignments, total] = await Promise.all([
      ScholarshipAssignment.find(filter).populate("student", "firstName lastName regNumber classLevel profilePhoto").populate("scholarship", "scholarshipName type").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ScholarshipAssignment.countDocuments(filter),
    ]);

    res.json({ assignments, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renewAssignment = async (req, res) => {
  try {
    const assignment = await ScholarshipAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Scholarship assignment not found" });

    assignment.expiryDate = req.body.newExpiryDate ? fmtDate(req.body.newExpiryDate) : assignment.expiryDate;
    assignment.status = "Renewed";
    await assignment.save();
    await ScholarshipHistory.create({ assignment: assignment._id, student: assignment.student, action: "Renewed", reason: req.body.reason || "Renewed", user: req.admin?._id || req.user?._id });
    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelAssignment = async (req, res) => {
  try {
    const assignment = await ScholarshipAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Scholarship assignment not found" });

    assignment.status = "Cancelled";
    await assignment.save();
    await ScholarshipHistory.create({ assignment: assignment._id, student: assignment.student, action: "Cancelled", reason: req.body.reason || "Cancelled", user: req.admin?._id || req.user?._id });
    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentScholarshipProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const assignments = await ScholarshipAssignment.find({ student: student._id }).populate("scholarship", "scholarshipName sponsor type discountType discountValue").sort({ createdAt: -1 });
    const history = await ScholarshipHistory.find({ student: student._id }).sort({ createdAt: -1 });
    res.json({ student, assignments, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { classLevel, session, type, sponsor, gender, performance } = req.query;
    const filter = {};
    if (classLevel) filter.classLevel = classLevel;
    if (session) filter.session = session;
    if (type) filter.type = type;
    if (sponsor) filter.sponsor = sponsor;
    if (gender) filter.gender = gender;

    const students = await Student.find(filter).select("_id firstName lastName regNumber classLevel session gender");
    const ids = students.map((s) => s._id);
    const assignments = await ScholarshipAssignment.find({ student: { $in: ids } }).populate("scholarship", "scholarshipName type sponsor discountType discountValue").populate("student", "firstName lastName regNumber classLevel session gender");

    res.json({ reports: assignments, totalBeneficiaries: assignments.length, scholarshipValue: assignments.reduce((sum, item) => sum + (item.discountAmount || 0), 0) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
