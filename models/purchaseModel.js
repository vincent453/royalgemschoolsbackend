import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, trim: true, uppercase: true, default: "" },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Supplier",
      default: null,
    },
    items: [
      {
        inventory:  { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
        itemName:   { type: String },
        quantity:   { type: Number, required: true, min: 1 },
        unitPrice:  { type: Number, required: true, min: 0 },
        totalCost:  { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount:  { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },
    notes:        { type: String, trim: true, default: "" },
    // Reference to Expense record created automatically
    expenseRef:   { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null },
  },
  { timestamps: true }
);

purchaseSchema.index({ purchaseDate: -1 });

export default mongoose.model("Purchase", purchaseSchema);
