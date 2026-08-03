import mongoose from "mongoose";

const scholarshipHistorySchema = new mongoose.Schema(
  {
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: "Scholarship" },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "ScholarshipAssignment" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    action: { type: String, enum: ["Created", "Updated", "Awarded", "Renewed", "Cancelled", "Expired"], required: true },
    reason: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ScholarshipHistory = mongoose.model("ScholarshipHistory", scholarshipHistorySchema);
export default ScholarshipHistory;
