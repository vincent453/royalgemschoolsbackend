import mongoose from "mongoose";

const scholarshipAssignmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: "Scholarship", required: true },
    feeStatement: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStatement" },
    originalFees: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    effectiveDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    session: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Expired", "Cancelled", "Renewed"], default: "Active" },
    reason: { type: String, default: "" },
    awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ScholarshipAssignment = mongoose.model("ScholarshipAssignment", scholarshipAssignmentSchema);
export default ScholarshipAssignment;
