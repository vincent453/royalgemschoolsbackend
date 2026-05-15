import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  pin:       { type: String, required: true, unique: true },
  isUsed:    { type: Boolean, default: false },
  usedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  usedAt:    { type: Date },
  generatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("Pin", pinSchema);