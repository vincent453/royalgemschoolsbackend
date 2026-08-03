import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    classLevel: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    resourceType: { type: String, enum: ["Video", "Document", "Link", "Article"], default: "Document" },
    url: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const LearningResource = mongoose.model("LearningResource", resourceSchema);
export default LearningResource;
