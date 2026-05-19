import mongoose from "mongoose";
 
const yearbookSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  regNumber:  { type: String, required: true, trim: true },
  classArm:   { type: String, required: true },
  session:    { type: String, required: true, default: "2024/2025" },
  quote:      { type: String, default: "" },
  ambition:   { type: String, default: "" },
  nickname:   { type: String, default: "" },
  photo:      { type: String, default: null },
  awards:     [{ type: String }],
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
 
// Index for fast session queries
yearbookSchema.index({ session: 1, classArm: 1 });
 
export default mongoose.model("Yearbook", yearbookSchema);