// models/subjectAssignmentModel.js
import mongoose from "mongoose";

const subjectAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  classLevels: [{
    type: String,
    required: true,
  }],
  session: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Ensure one teacher has only one assignment per subject per session
subjectAssignmentSchema.index(
  { teacher: 1, subject: 1, session: 1 },
  { unique: true }
);

export default mongoose.model("SubjectAssignment", subjectAssignmentSchema);