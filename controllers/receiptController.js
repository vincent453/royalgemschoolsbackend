// controllers/receiptController.js
import Receipt from "../models/Receiptmodel.js";
import { issueReceipt } from "../services/receiptService.js";
import { buildReceiptPdf } from "../utils/receiptPdf.js";

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 20;

// ── GET /api/receipts ───────────────────────────────────────
// Admin — list all receipts with search, date filters, pagination
export const getAllReceipts = async (req, res) => {
  try {
    const {
      search, range, startDate, endDate,
      page = PAGE_DEFAULT, limit = LIMIT_DEFAULT,
      sort = "-issuedAt",
    } = req.query;

    const filter = {};

    // Date range presets
    if (range && range !== "custom") {
      const now = new Date();
      let from;
      if (range === "today") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (range === "week") {
        from = new Date(now);
        from.setDate(now.getDate() - 7);
      } else if (range === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (from) filter.issuedAt = { $gte: from };
    } else if (startDate || endDate) {
      filter.issuedAt = {};
      if (startDate) filter.issuedAt.$gte = new Date(startDate);
      if (endDate)   filter.issuedAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    // Search across receipt number / reference, plus student fields via populate match
    let studentIds = null;
    if (search) {
      const Student = (await import("../models/studentModel.js")).default;
      const students = await Student.find({
        $or: [
          { firstName:  { $regex: search, $options: "i" } },
          { lastName:   { $regex: search, $options: "i" } },
          { regNumber:  { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      studentIds = students.map((s) => s._id);

      filter.$or = [
        { receiptNumber:    { $regex: search, $options: "i" } },
        { paymentReference: { $regex: search, $options: "i" } },
        ...(studentIds.length ? [{ student: { $in: studentIds } }] : []),
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || LIMIT_DEFAULT);
    const skip     = (pageNum - 1) * limitNum;

    const [receipts, total] = await Promise.all([
      Receipt.find(filter)
        .populate("student", "firstName lastName regNumber classLevel")
        .populate("issuedBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Receipt.countDocuments(filter),
    ]);

    res.json({
      receipts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/stats ─────────────────────────────────
// Admin — dashboard cards
export const getReceiptStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalReceipts,
      todayAgg,
      monthAgg,
      allAgg,
    ] = await Promise.all([
      Receipt.countDocuments({ status: "issued" }),
      Receipt.aggregate([
        { $match: { status: "issued", issuedAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Receipt.aggregate([
        { $match: { status: "issued", issuedAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Receipt.aggregate([
        { $match: { status: "issued" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      totalReceipts,
      todayCount:       todayAgg[0]?.count || 0,
      todayCollections: todayAgg[0]?.total || 0,
      monthCount:       monthAgg[0]?.count || 0,
      monthCollections: monthAgg[0]?.total || 0,
      totalRevenue:     allAgg[0]?.total   || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/search ────────────────────────────────
// Lightweight search (used for quick autocomplete-style search)
export const searchReceipts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const Student = (await import("../models/studentModel.js")).default;
    const students = await Student.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName:  { $regex: q, $options: "i" } },
        { regNumber: { $regex: q, $options: "i" } },
      ],
    }).select("_id");

    const receipts = await Receipt.find({
      $or: [
        { receiptNumber:    { $regex: q, $options: "i" } },
        { paymentReference: { $regex: q, $options: "i" } },
        { student: { $in: students.map((s) => s._id) } },
      ],
    })
      .populate("student", "firstName lastName regNumber")
      .sort("-issuedAt")
      .limit(15);

    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/me ────────────────────────────────────
// Parent/Student portal — receipts for the logged-in student
export const getMyReceipts = async (req, res) => {
  try {
    const studentId = req.studentId;
    if (!studentId) return res.status(401).json({ message: "Not authorized" });

    const receipts = await Receipt.find({ student: studentId, status: "issued" })
      .sort("-issuedAt");

    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/student/:studentId ────────────────────
// Admin — all receipts for a specific student
export const getReceiptsByStudent = async (req, res) => {
  try {
    const receipts = await Receipt.find({ student: req.params.studentId, status: "issued" })
      .populate("issuedBy", "name")
      .sort("-issuedAt");

    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/:id ───────────────────────────────────
// Single receipt — admin sees any, portal user only their own
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("student", "firstName lastName regNumber classLevel session parentEmail")
      .populate("issuedBy", "name")
      .populate("feeStatement", "reference dueDate items");

    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    // Portal access control — student/parent can only view their own
    if (req.studentId && String(receipt.student._id) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/receipts/download/:id ──────────────────────────
// Streams a generated PDF
export const downloadReceiptPdf = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("student", "firstName lastName regNumber classLevel session")
      .populate("issuedBy", "name");

    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    if (req.studentId && String(receipt.student._id) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pdfBuffer = await buildReceiptPdf(receipt);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/receipts/manual ───────────────────────────────
// Admin records a manual (cash/bank transfer/POS) payment against
// a fee statement. This creates a FeePayment-equivalent ledger entry
// AND issues the receipt, updating the FeeStatement balance.
export const recordManualPayment = async (req, res) => {
  try {
    const { feeStatementId, amount, paymentMethod, paymentReference, description } = req.body;

    if (!feeStatementId || !amount || !paymentMethod) {
      return res.status(400).json({
        message: "feeStatementId, amount and paymentMethod are required",
      });
    }

    const allowedMethods = ["cash", "bank_transfer", "pos", "cheque", "other"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: `paymentMethod must be one of: ${allowedMethods.join(", ")}`,
      });
    }

    const FeeStatement = (await import("../models/feeStatementModel.js")).default;
    const statement = await FeeStatement.findById(feeStatementId);
    if (!statement) return res.status(404).json({ message: "Fee statement not found" });

    const paidAmount = Number(amount);
    if (paidAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    // Update the fee statement balance
    statement.amountPaid = (statement.amountPaid || 0) + paidAmount;
    const balance = Math.max(0, statement.amountDue - statement.amountPaid);
    statement.balance = balance;
    statement.status  = balance <= 0 ? "paid" : statement.amountPaid > 0 ? "partial" : "pending";
    await statement.save();

    // Issue the receipt — the ONLY way receipts get created
    const issuedBy = req.admin?._id || req.user?._id || null;
    const receipt = await issueReceipt({
      feeStatementId: statement._id,
      amount:          paidAmount,
      paymentMethod,
      paymentReference: paymentReference || "",
      paymentGateway:   "manual",
      description:      description || "",
      issuedBy,
    });

    res.status(201).json({ receipt, feeStatement: statement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  getAllReceipts,
  getReceiptStats,
  searchReceipts,
  getMyReceipts,
  getReceiptsByStudent,
  getReceiptById,
  downloadReceiptPdf,
  recordManualPayment,
};