import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // ─── Student Reference ───────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    // ─── Academic Context ────────────────────────────────
    classLevel: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    // ─── Attendance Data ─────────────────────────────────
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
      default: "absent",
      lowercase: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    // ─── Staff/Admin who recorded attendance ────────────
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes for performance ─────────────────────────────
// Unique constraint: One attendance record per student per day
attendanceSchema.index({ student: 1, date: 1, term: 1 }, { unique: true });
// Fast queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ classLevel: 1, date: 1 });
attendanceSchema.index({ student: 1, createdAt: -1 });
attendanceSchema.index({ status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
