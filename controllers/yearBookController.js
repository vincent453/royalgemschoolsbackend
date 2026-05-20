import { v2 as cloudinary } from "cloudinary";
import Yearbook from "../models/yearBook.js";
 
// Cloudinary upload helper
const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "yearbook_photos" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
};
 
// ── GET /api/yearbook (admin — all entries for a session) ──────────
export const getEntries = async (req, res) => {
  try {
    const { session = "2024/2025" } = req.query;
    const entries = await Yearbook.find({ session }).sort({ isFeatured: -1, classArm: 1, name: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── GET /api/yearbook/public (public — no auth needed) ────────────
export const getPublicEntries = async (req, res) => {
  try {
    const { session = "2024/2025" } = req.query;
    const entries = await Yearbook
      .find({ session })
      .select("-__v")
      .sort({ isFeatured: -1, classArm: 1, name: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── POST /api/yearbook (create) ────────────────────────────────────
export const createEntry = async (req, res) => {
  try {
    const { name, regNumber, classArm, session, quote, ambition, nickname, photo, awards, isFeatured } = req.body;
 
    if (!name?.trim() || !regNumber?.trim() || !classArm) {
      return res.status(400).json({ message: "Name, reg number and class are required." });
    }
 
    const entry = await Yearbook.create({
      name: name.trim(),
      regNumber: regNumber.trim().toUpperCase(),
      classArm, session, quote, ambition, nickname,
      photo: photo || null,
      awards: awards || [],
      isFeatured: isFeatured ?? false,
    });
 
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── PATCH /api/yearbook/:id (update) ──────────────────────────────
export const updateEntry = async (req, res) => {
  try {
    const allowed = ["name","regNumber","classArm","session","quote","ambition","nickname","photo","awards","isFeatured"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
 
    const entry = await Yearbook.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── DELETE /api/yearbook/:id ───────────────────────────────────────
export const deleteEntry = async (req, res) => {
  try {
    const entry = await Yearbook.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── POST /api/yearbook/upload (photo to Cloudinary) ───────────────
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};