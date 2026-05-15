import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  teacherId:   { type: String, unique: true },
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  phone:       { type: String },
  dob:         { type: Date },
  gender:      { type: String, enum: ["Male", "Female"] },
  photo:       { type: String, default: "" },
  address:     { type: String },
  city:        { type: String },
  subjects:    [{ type: String }],
  classes:     [{ 
    type: String, 
    enum: ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"] 
  }],
  education: [{
    university: { type: String },
    degree:     { type: String },
    startDate:  { type: Date },
    endDate:    { type: Date },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate teacher ID
teacherSchema.pre("save", async function (next) {
  if (!this.teacherId) {
    const count = await mongoose.model("Teacher").countDocuments();
    const year  = new Date().getFullYear().toString().slice(-2);
    this.teacherId = `RGT-${year}-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

teacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model("Teacher", teacherSchema);