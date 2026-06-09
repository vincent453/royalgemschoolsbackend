// models/classSubjectConfigModel.js
import mongoose from "mongoose";

const classSubjectConfigSchema = new mongoose.Schema({
  classLevel: { type: String, required: true },
  session:    { type: String, required: true },
  term:       { type: String, required: true },
  requiredSubjects: [{ type: String, trim: true }],
}, { timestamps: true });

classSubjectConfigSchema.index(
  { classLevel: 1, session: 1, term: 1 },
  { unique: true }
);

export default mongoose.model("ClassSubjectConfig", classSubjectConfigSchema);