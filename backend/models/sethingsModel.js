import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  schoolName:  { type: String, default: "Royal Gem Schools" },
  tagline:     { type: String, default: "Nurturing to Flourish" },
  email:       { type: String },
  phone:       { type: String },
  address:     { type: String },
  address2:    { type: String },
  website:     { type: String },
  logo:        { type: String, default: "" },
  session:     { type: String, default: "2024/2025" },
  currentTerm: { type: String, default: "1st Term" },
  notifications: {
    resultUploaded: { type: Boolean, default: true },
    newStudent:     { type: Boolean, default: true },
    newTeacher:     { type: Boolean, default: false },
    systemAlert:    { type: Boolean, default: true },
    emailNotif:     { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);