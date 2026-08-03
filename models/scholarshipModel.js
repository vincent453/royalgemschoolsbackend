import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    scholarshipName: { type: String, required: true, trim: true },
    scholarshipCode: { type: String, required: true, trim: true, unique: true, uppercase: true },
    description: { type: String, default: "" },
    sponsor: { type: String, default: "" },
    type: { type: String, default: "Academic" },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, default: 0 },
    applicableClasses: { type: [String], default: [] },
    applicableSession: { type: String, default: "" },
    maxBeneficiaries: { type: Number, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    eligibilityRequirements: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive", "Expired", "Cancelled"], default: "Active" },
    currentBeneficiaries: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Scholarship = mongoose.model("Scholarship", scholarshipSchema);
export default Scholarship;
