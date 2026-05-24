import jwt     from "jsonwebtoken";
import Pin     from "../models/pinModle.js";
import Student from "../models/studentModel.js";
import Result  from "../models/resultModel.js";

// ── helpers ──────────────────────────────────────────────────
const randPin = (len = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  for (let i = 0; i < len; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
};

// ── GET /api/pins/students?classLevel=JSS+1 ──────────────────
// Admin fetches students to populate the generate PIN dropdown
export const getStudentsForPin = async (req, res) => {
  try {
    const { classLevel } = req.query;

    const filter =
      classLevel && classLevel !== "All Classes"
        ? { classLevel }
        : {};

    const students = await Student.find(filter)
      .sort({ firstName: 1 })
      .select("_id firstName lastName regNumber classLevel");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/pins/generate ───────────────────────────────────
// Admin generates PINs for one or more students
export const generatePins = async (req, res) => {
  try {
    const { studentIds, term, session, pinLength = 8 } = req.body;

    if (!studentIds?.length || !term || !session) {
      return res
        .status(400)
        .json({ message: "studentIds, term and session are required" });
    }

    const results = [];

    for (const sid of studentIds) {
      const student = await Student.findById(sid);
      if (!student) continue;

      // Invalidate any existing unused PINs for this student
      await Pin.updateMany(
        { usedBy: student._id, isUsed: false },
        { isUsed: true }
      );

      const raw = randPin(Number(pinLength));

      await Pin.create({
        pin:         raw,
        isUsed:      false,
        usedBy:      student._id,
        generatedBy: req.admin._id,
        expiresAt:   null,
      });

      results.push({
        reg:     student.regNumber,
        name:    `${student.firstName} ${student.lastName}`,
        class:   student.classLevel,
        pin:     raw,
        term,
        session,
      });
    }

    res.status(201).json({ success: true, pins: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/pins/login ──────────────────────────────────────
// Student or parent logs in with regNumber + PIN
export const pinLogin = async (req, res) => {
  try {
    const { regNumber, pin, role } = req.body;

    if (!regNumber || !pin || !role) {
      return res
        .status(400)
        .json({ message: "regNumber, pin and role are required" });
    }

    const student = await Student.findOne({
      regNumber: regNumber.trim().toUpperCase(),
    });
    if (!student) {
      return res
        .status(401)
        .json({ message: "Invalid registration number or PIN" });
    }

    // Find the most recent unused PIN for this student
    const pinDoc = await Pin.findOne({
      usedBy: student._id,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!pinDoc) {
      return res.status(401).json({
        message: "No active PIN found. Please contact the school office.",
      });
    }

    if (pinDoc.expiresAt && new Date() > pinDoc.expiresAt) {
      return res
        .status(401)
        .json({ message: "PIN has expired. Please contact the school." });
    }

    // Compare — stored as plain text
    const inputPin = pin.trim().toUpperCase();
    if (pinDoc.pin !== inputPin) {
      return res
        .status(401)
        .json({ message: "Invalid registration number or PIN" });
    }

    // Mark PIN as used
    pinDoc.isUsed = true;
    pinDoc.usedAt = new Date();
    await pinDoc.save();

    const token = jwt.sign(
      { id: student._id, studentId: student._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      role,
      student: {
        _id:          student._id,
        firstName:    student.firstName,
        lastName:     student.lastName,
        classLevel:   student.classLevel,
        regNumber:    student.regNumber,
        profilePhoto: student.profilePhoto,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/pins/student/:studentId ─────────────────────────
export const getStudentData = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const results = await Result.find({ student: studentId }).sort({
      createdAt: -1,
    });

    res.json({ student, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};