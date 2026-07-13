import mongoose from "mongoose";

// Auto-generate product code: SHOP-YYYYMMDD-XXXXX
const generateCode = () => {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SHOP-${date}-${suffix}`;
};

const productSchema = new mongoose.Schema(
  {
    productName:      { type: String, required: true, trim: true },
    productCode:      { type: String, unique: true, default: generateCode },
    sku:              { type: String, trim: true, default: "" },
    brand:            { type: String, trim: true, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "ProductCategory",
      required: true,
    },

    description:      { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "" },
    tags:             [{ type: String, trim: true }],

    // Pricing
    price:            { type: Number, required: true, min: 0 },
    discountPrice:    { type: Number, default: null, min: 0 },
    costPrice:        { type: Number, default: 0,    min: 0 },

    // Images (Cloudinary URLs)
    images:           [{ type: String }],

    // ── Linked to Inventory module ────────────────────────────
    // Stock quantity is ALWAYS read from the linked InventoryItem.
    // We never store a duplicate quantity here.
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Inventory",
      default: null,
    },

    weight:       { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },

    status: {
      type:    String,
      enum:    ["Active", "Inactive", "Out of Stock"],
      default: "Active",
    },

    // Aggregate stats (updated on each order)
    totalSold:     { type: Number, default: 0 },
    totalRevenue:  { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

productSchema.index({ productName: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ isFeatured: 1 });

export default mongoose.model("Product", productSchema);