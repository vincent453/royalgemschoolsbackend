import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    subject:     { type: String, required: true, trim: true },
    classLevel:  { type: String, required: true, trim: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    dueDate:    { type: Date, required: true },
    maxScore:   { type: Number, default: 100, min: 1 },
    attachment: { type: String, default: null }, // Cloudinary URL
    attachmentName: { type: String, default: null }, // original filename
    status: {
      type:    String,
      enum:    ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ classLevel: 1, subject: 1 });
assignmentSchema.index({ teacher: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });

export default mongoose.model("Assignment", assignmentSchema);