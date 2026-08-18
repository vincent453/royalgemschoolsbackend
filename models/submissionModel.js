import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Student",
      required: true,
    },
    attachment:     { type: String, default: null }, // Cloudinary URL
    attachmentName: { type: String, default: null }, // original filename
    comment:        { type: String, trim: true, default: "" },
    submittedAt:    { type: Date, default: null },
    status: {
      type:    String,
      enum:    ["pending", "submitted", "late", "graded"],
      default: "pending",
    },
    score:     { type: Number, default: null, min: 0 },
    feedback:  { type: String, trim: true, default: "" },
    gradedAt:  { type: Date, default: null },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },
  },
  { timestamps: true }
);

// One submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1, status: 1 });

export default mongoose.model("Submission", submissionSchema);