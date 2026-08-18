import mongoose from "mongoose";

const CATEGORIES = [
  "Public Speaking", "Programming", "Culture", "Financial Literacy",
  "Science & Space", "Biology", "Geography & World Knowledge",
  "Art, Creativity & Design", "General Knowledge", "Bible Knowledge & Christian Character",
];

const learningResourceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    subject:    { type: String, trim: true, default: "" },
    classLevel: { type: String, trim: true, default: "" }, // empty = all classes
    url:        { type: String, trim: true, default: "" }, // external link
    image:      { type: String, default: null },  // thumbnail (Cloudinary)
    attachment: { type: String, default: null },  // downloadable file (Cloudinary)
    attachmentName: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
  },
  { timestamps: true }
);

learningResourceSchema.index({ classLevel: 1, category: 1 });
learningResourceSchema.index({ subject: 1 });

export { CATEGORIES };
export default mongoose.model("LearningResource", learningResourceSchema);