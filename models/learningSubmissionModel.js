import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "LearningAssignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, default: "" },
    content: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Submitted", "Graded", "Late"], default: "Submitted" },
    score: { type: Number, default: null },
    feedback: { type: String, default: "" },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const LearningSubmission = mongoose.model("LearningSubmission", submissionSchema);
export default LearningSubmission;
