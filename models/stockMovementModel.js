EOFILE

cat > /home/claude/inventory/stockMovementModel.js << 'EOFILE'
import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Inventory",
      required: true,
    },
    itemName:  { type: String },          // snapshot at time of movement
    type: {
      type: String,
      required: true,
      enum: ["Stock In", "Stock Out", "Adjustment", "Damaged", "Lost", "Returned", "Transferred"],
    },
    quantity:       { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter:  { type: Number, required: true },
    reason:         { type: String, trim: true, default: "" },
    reference:      { type: String, trim: true, default: "" }, // e.g. purchase id or invoice
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ inventory: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });

export default mongoose.model("StockMovement", stockMovementSchema);
