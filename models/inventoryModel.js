import mongoose from "mongoose";

// Auto-generate item code: INV-2026-000001
const buildItemCode = async () => {
  const year   = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last   = await mongoose.model("Inventory")
    .findOne({ itemCode: { $regex: `^${prefix}` } })
    .sort({ itemCode: -1 }).lean();
  let seq = 1;
  if (last) {
    const n = parseInt(last.itemCode.split("-").pop(), 10);
    if (!isNaN(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(6, "0")}`;
};

const inventorySchema = new mongoose.Schema(
  {
    itemCode:      { type: String, unique: true, uppercase: true, trim: true },
    itemName:      { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Books", "Uniforms", "Stationery", "Laboratory Equipment",
        "Computers", "Printers", "Projectors", "Furniture",
        "Sports Equipment", "Cleaning Materials", "Office Supplies", "Other",
      ],
    },
    description:   { type: String, trim: true, default: "" },
    quantity:      { type: Number, default: 0, min: 0 },
    unit:          { type: String, trim: true, default: "piece" },
    minimumStock:  { type: Number, default: 5, min: 0 },
    purchasePrice: { type: Number, default: 0, min: 0 },
    sellingPrice:  { type: Number, default: 0, min: 0 },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    location:  { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "Out of Stock",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-generate itemCode before save
inventorySchema.pre("save", async function (next) {
  if (!this.itemCode) {
    this.itemCode = await buildItemCode();
  }
  // Auto-compute status
  if (this.quantity <= 0) {
    this.status = "Out of Stock";
  } else if (this.quantity <= this.minimumStock) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }
  next();
});

// Also compute status on findOneAndUpdate
inventorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const qty    = update?.quantity ?? update?.$set?.quantity;
  const min    = update?.minimumStock ?? update?.$set?.minimumStock;
  if (qty !== undefined) {
    let status = "In Stock";
    if (qty <= 0) status = "Out of Stock";
    else if (min !== undefined && qty <= min) status = "Low Stock";
    this.set({ status });
  }
  next();
});

inventorySchema.index({ category: 1 });
inventorySchema.index({ status: 1 });

export default mongoose.model("Inventory", inventorySchema);
