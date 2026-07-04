import mongoose from "mongoose";

const subjectResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject:    { type: String, required: true, trim: true },
  classLevel: { type: String, required: true },
  term:       { type: String, required: true },
  session:    { type: String, required: true },

  // ── Scores (cwk removed) ─────────────────────────────────
  hwk:  { type: Number, default: 0, min: 0, max: 10 }, // Home Work   0–10
  ca1:  { type: Number, default: 0, min: 0, max: 10 }, // CA1         0–10
  ca2:  { type: Number, default: 0, min: 0, max: 10 }, // CA2         0–10
  exam: { type: Number, default: 0, min: 0, max: 60 }, // Exam        0–60
  // total = hwk + ca1 + ca2 + exam = max 90

  // ── Carry-forward averages (stored on 2nd and 3rd term records) ──
  // These are pulled from previous term Result documents at finalize time
  firstTermAverage:  { type: Number, default: null }, // stored on 2nd & 3rd term
  secondTermAverage: { type: Number, default: null }, // stored on 3rd term only

  // ── Computed ─────────────────────────────────────────────
  total:  { type: Number, default: 0 },   // raw out of 90
  grade:  { type: String },
  remark: { type: String },

  status: {
    type: String,
    enum: ["draft", "submitted"],
    default: "submitted",
  },
}, { timestamps: true });

// One subject result per student per subject per term per session
subjectResultSchema.index(
  { student: 1, subject: 1, term: 1, session: 1 },
  { unique: true }
);

export default mongoose.model("SubjectResult", subjectResultSchema);