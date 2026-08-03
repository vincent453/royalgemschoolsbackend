import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    classLevel: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignmentType: { type: String, default: "Homework" },
    attachmentUrl: { type: String, default: "" },
    learningResourceUrl: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    session: { type: String, default: "" },
    term: { type: String, default: "Term 1" },
    targetType: { type: String, enum: ["class", "students"], default: "class" },
    targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    status: { type: String, enum: ["Draft", "Published", "Archived"], default: "Published" },
  },
  { timestamps: true }
);

const LearningAssignment = mongoose.model("LearningAssignment", assignmentSchema);
export default LearningAssignment;
