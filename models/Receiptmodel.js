import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeStatement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStatement",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeePayment",
      // Null for manual payments not tied to a Paystack FeePayment record
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "cash", "bank_transfer", "pos", "cheque", "other"],
      required: true,
    },
    paymentReference: {
      type: String,
      trim: true,
      default: "",
    },
    paymentGateway: {
      type: String,
      enum: ["paystack", "manual"],
      required: true,
      default: "manual",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["issued", "void"],
      default: "issued",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      // Admin or User (staff) who recorded a manual payment.
      // Null when auto-generated from a Paystack webhook.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    classLevel: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Fast lookups
receiptSchema.index({ student: 1, createdAt: -1 });
receiptSchema.index({ feeStatement: 1 });
receiptSchema.index({ issuedAt: -1 });

const Receipt = mongoose.model("Receipt", receiptSchema);
export default Receipt;