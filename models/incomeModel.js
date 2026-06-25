import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, default: "General" },
  source: { type: String },
  date: { type: Date, default: Date.now },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  receiptRef: { type: String },
}, { timestamps: true });

export default mongoose.model("Income", incomeSchema);
