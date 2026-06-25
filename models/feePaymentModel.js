import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    feeStatement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStatement",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    gateway: {
      type: String,
      required: true,
      default: "paystack",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    accessCode: {
      type: String,
      trim: true,
    },
    authorizationUrl: {
      type: String,
      trim: true,
    },
    paystackReference: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const FeePayment = mongoose.model("FeePayment", feePaymentSchema);
export default FeePayment;
