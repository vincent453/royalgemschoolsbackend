import { v2 as cloudinary } from "cloudinary";
import Student from "../models/studentModel.js";

const uploadToCloudinary = (buffer) => {
  // ✅ Configure here — by the time this runs, .env is already loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "students" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};


// @desc Add new student
// @route POST /api/students
export const addStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      classLevel,
      session,
      regNumber,
      gender,
      dateOfBirth,
      placeOfBirth,
      address,
      parentFirstName,
      parentLastName,
      parentPhone,
      parentEmail,
    } = req.body;

    if (!firstName || !lastName || !classLevel || !session || !regNumber || !gender) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existing = await Student.findOne({ regNumber });
    if (existing) {
      return res.status(400).json({ message: "Reg Number already exists" });
    }

    // ✅ Upload from memory buffer
    let profilePhotoUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profilePhotoUrl = result.secure_url;
    }

    const student = await Student.create({
      firstName,
      lastName,
      classLevel,
      session,
      regNumber,
      gender,
      dateOfBirth,
      placeOfBirth,
      address,
      parentFirstName,
      parentLastName,
      parentPhone,
      parentEmail,
      profilePhoto: profilePhotoUrl,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Update student
// @route PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // ✅ Upload new photo from buffer if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.profilePhoto = result.secure_url;
    }

    const updated = await Student.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all students
// @route GET /api/students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete student
// @route DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};