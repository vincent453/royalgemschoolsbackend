// services/receiptService.js
// Central place that creates Receipt records.
// Receipts are NEVER created directly by a controller — always through here,
// so the numbering scheme and required fields stay consistent everywhere.

import Receipt from "../models/resultModel.js";
import FeeStatement from "../models/feeStatementModel.js";

// Receipt number format: RGS-YYYY-000001 (sequential per year)
const buildReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `RGS-${year}-`;

  // Find the highest existing number for this year and increment
  const last = await Receipt.findOne({ receiptNumber: { $regex: `^${prefix}` } })
    .sort({ receiptNumber: -1 })
    .lean();

  let nextSeq = 1;
  if (last) {
    const lastSeq = parseInt(last.receiptNumber.split("-").pop(), 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
};

/**
 * Creates a Receipt for a successful payment against a FeeStatement.
 * Called from:
 *   - Paystack webhook handler (paymentGateway: "paystack")
 *   - Manual payment recording (paymentGateway: "manual")
 *
 * @param {Object} params
 * @param {String} params.feeStatementId
 * @param {String} [params.paymentId]      - FeePayment _id, if from Paystack
 * @param {Number} params.amount
 * @param {String} params.paymentMethod    - "paystack" | "cash" | "bank_transfer" | "pos" | "cheque" | "other"
 * @param {String} [params.paymentReference]
 * @param {String} params.paymentGateway   - "paystack" | "manual"
 * @param {String} [params.description]
 * @param {String} [params.issuedBy]       - User _id of staff who recorded a manual payment
 */
export const issueReceipt = async ({
  feeStatementId,
  paymentId = null,
  amount,
  paymentMethod,
  paymentReference = "",
  paymentGateway,
  description = "",
  issuedBy = null,
}) => {
  const statement = await FeeStatement.findById(feeStatementId).populate("student");
  if (!statement) {
    throw new Error("Fee statement not found — cannot issue receipt.");
  }

  const receiptNumber = await buildReceiptNumber();

  const receipt = await Receipt.create({
    receiptNumber,
    student:          statement.student._id,
    feeStatement:     statement._id,
    payment:          paymentId,
    amount,
    paymentMethod,
    paymentReference,
    paymentGateway,
    description:      description || `Payment towards ${statement.term} ${statement.session} fees`,
    status:           "issued",
    issuedAt:          new Date(),
    issuedBy,
    session:           statement.session,
    term:              statement.term,
    classLevel:        statement.classLevel,
  });

  return receipt;
};

export default { issueReceipt };