import { v2 as cloudinary } from "cloudinary";
import Student from "../models/studentModel.js";

const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
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
      firstName, lastName, classLevel, session, regNumber,
      gender, dateOfBirth, placeOfBirth, address,
      parentFirstName, parentLastName, parentPhone, parentEmail,
    } = req.body;

    if (!firstName || !lastName || !classLevel || !session || !regNumber || !gender) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existing = await Student.findOne({ regNumber });
    if (existing) {
      return res.status(400).json({ message: "Reg Number already exists" });
    }

    let profilePhotoUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profilePhotoUrl = result.secure_url;
    }

    const student = await Student.create({
      firstName, lastName, classLevel, session, regNumber,
      gender, dateOfBirth, placeOfBirth, address,
      parentFirstName, parentLastName, parentPhone, parentEmail,
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

// @desc Get students
// @route GET /api/students
// Admin  → returns ALL students
// Teacher → returns only students in their assignedClass
export const getStudents = async (req, res) => {
  try {
    let filter = {};

    if (req.user && req.user.role === "teacher") {
      // Teacher is set on req.user by protectAdminOrUser middleware
      if (!req.user.assignedClass) {
        // Teacher has no class assigned yet — return empty array
        return res.status(200).json([]);
      }
      filter.classLevel = req.user.assignedClass;
    }
    // req.admin means it's a super admin — no filter, see everything

    const students = await Student.find(filter).sort({ createdAt: -1 });
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