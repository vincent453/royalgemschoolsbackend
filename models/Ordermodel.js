import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true }, // snapshot at time of order
  productCode: { type: String },
  image:       { type: String, default: null },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  subtotal:    { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type:    String,
      unique:  true,
      default: () => `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    },

    // ── Customer (portal student/parent) ─────────────────────
    customer: {
      studentId:   { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      name:        { type: String, required: true },
      email:       { type: String },
      phone:       { type: String },
    },

    // ── Items ─────────────────────────────────────────────────
    items: [orderItemSchema],

    // ── Pricing ───────────────────────────────────────────────
    subtotal:     { type: Number, required: true },
    deliveryFee:  { type: Number, default: 0 },
    discount:     { type: Number, default: 0 },
    total:        { type: Number, required: true },

    // ── Delivery ──────────────────────────────────────────────
    deliveryAddress: { type: String, default: "" },
    notes:           { type: String, default: "" },

    // ── Payment ───────────────────────────────────────────────
    paymentMethod: {
      type:    String,
      enum:    ["paystack", "cash", "bank_transfer"],
      default: "paystack",
    },
    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paystackReference: { type: String, default: null },
    paystackResponse:  { type: mongoose.Schema.Types.Mixed, default: null },
    paidAt:            { type: Date, default: null },

    // ── Order status ──────────────────────────────────────────
    orderStatus: {
      type:    String,
      enum:    ["pending", "paid", "processing", "ready", "delivered", "cancelled"],
      default: "pending",
    },

    // ── Linked records (auto-created on payment) ──────────────
    incomeRecord:  { type: mongoose.Schema.Types.ObjectId, ref: "Income",  default: null },
    receiptNumber: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ "customer.studentId": 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);