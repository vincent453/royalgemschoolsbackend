import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date:     { type: String, required: true },          // readable string e.g. "May 20, 2026"
    image:    { type: String, default: null },            // Cloudinary URL
    href:     { type: String, default: "" },              // optional external link
    author:   { type: String, default: "Royal Gem Schools" },
    createdBy: {
      id:   { type: mongoose.Schema.Types.ObjectId },
      role: { type: String },                             // "admin" | "teacher"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
