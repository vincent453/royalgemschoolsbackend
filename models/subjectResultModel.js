// models/subjectResultModel.js
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

  // Scores
  cwk:  { type: Number, default: 0, min: 0, max: 10 },
  hwk:  { type: Number, default: 0, min: 0, max: 10 },
  ca1:  { type: Number, default: 0, min: 0, max: 10 },
  ca2:  { type: Number, default: 0, min: 0, max: 10 },
  exam: { type: Number, default: 0, min: 0, max: 60 },

  // Computed
  total:  { type: Number, default: 0 },
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