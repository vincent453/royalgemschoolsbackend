import mongoose from "mongoose";

const feeItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const feeStatementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
      trim: true,
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
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: {
      type: [feeItemSchema],
      default: [],
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeePayment",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const FeeStatement = mongoose.model("FeeStatement", feeStatementSchema);
export default FeeStatement;
