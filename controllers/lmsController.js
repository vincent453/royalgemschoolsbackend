import { v2 as cloudinary } from "cloudinary";
import Assignment      from "../models/assignmentModel.js";
import Submission      from "../models/submissionModel.js";
import LearningResource, { CATEGORIES } from "../models/learningResourceModel.js";
import Student         from "../models/studentModel.js";

// ─────────────────────────────────────────────────────────────
// Cloudinary upload helper — same pattern as rest of codebase
// ─────────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: resourceType }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// ─────────────────────────────────────────────────────────────
// ASSIGNMENTS — Teacher CRUD
// ─────────────────────────────────────────────────────────────

// POST /api/lms/assignments
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, classLevel, dueDate, maxScore, status } = req.body;
    const teacherId = req.user?._id ?? req.admin?._id;

    if (!title?.trim())    return res.status(400).json({ message: "Title is required" });
    if (!subject?.trim())  return res.status(400).json({ message: "Subject is required" });
    if (!classLevel?.trim())return res.status(400).json({ message: "Class is required" });
    if (!dueDate)          return res.status(400).json({ message: "Due date is required" });

    let attachment = null;
    let attachmentName = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "lms/assignments");
      attachment = result.secure_url;
      attachmentName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description?.trim() ?? "",
      subject:     subject.trim(),
      classLevel:  classLevel.trim(),
      teacher:     teacherId,
      dueDate:     new Date(dueDate),
      maxScore:    Number(maxScore) || 100,
      attachment,
      attachmentName,
      status:      status ?? "draft",
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lms/assignments  (teacher sees their own; admin sees all)
export const getAssignments = async (req, res) => {
  try {
    const { classLevel, subject, status } = req.query;
    const filter = {};

    // Teachers only see their own assignments
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      filter.teacher = req.user._id;
    }

    if (classLevel) filter.classLevel = classLevel;
    if (subject)    filter.subject    = subject;
    if (status)     filter.status     = status;

    const assignments = await Assignment.find(filter)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lms/assignments/:id
export const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("teacher", "name email");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/lms/assignments/:id
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Only the teacher who created it or an admin can edit
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (assignment.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only edit your own assignments." });
      }
    }

    const allowed = ["title","description","subject","classLevel","dueDate","maxScore","status"];
    allowed.forEach(k => { if (req.body[k] !== undefined) assignment[k] = req.body[k]; });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "lms/assignments");
      assignment.attachment = result.secure_url;
      assignment.attachmentName = req.file.originalname;
    }

    await assignment.save();
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/lms/assignments/:id
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (assignment.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only delete your own assignments." });
      }
    }

    await assignment.deleteOne();
    await Submission.deleteMany({ assignment: req.params.id });
    res.json({ success: true, message: "Assignment deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SUBMISSIONS — Teacher views, Student submits
// ─────────────────────────────────────────────────────────────

// GET /api/lms/assignments/:id/submissions  (teacher only)
export const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Only the teacher who owns the assignment (or admin) can see submissions
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (assignment.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    // Get all students in the class
    const students = await Student.find({ classLevel: assignment.classLevel })
      .select("_id firstName lastName regNumber profilePhoto classLevel");

    // Get existing submissions
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "firstName lastName regNumber profilePhoto classLevel")
      .populate("gradedBy", "name");

    // Map: every student gets a submission row (or null if not submitted)
    const mapped = students.map(student => {
      const sub = submissions.find(
        s => s.student?._id?.toString() === student._id.toString()
      );
      return { student, submission: sub ?? null };
    });

    res.json({ success: true, assignment, submissions: mapped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/lms/assignments/:id/submit  (student via portal)
export const submitAssignment = async (req, res) => {
  try {
    const { comment } = req.body;
    const studentId   = req.studentId; // set by protectPortal

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (assignment.status !== "published") {
      return res.status(400).json({ message: "This assignment is not published." });
    }

    // Verify the student is in the right class
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.classLevel !== assignment.classLevel) {
      return res.status(403).json({ message: "This assignment is not for your class." });
    }

    let attachment = null;
    let attachmentName = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "lms/submissions");
      attachment = result.secure_url;
      attachmentName = req.file.originalname;
    }

    const now      = new Date();
    const isLate   = now > new Date(assignment.dueDate);
    const status   = isLate ? "late" : "submitted";

    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: studentId },
      {
        attachment,
        attachmentName,
        comment:     comment?.trim() ?? "",
        submittedAt: now,
        status,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, submission, isLate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lms/my-assignments  (student portal)
export const getMyAssignments = async (req, res) => {
  try {
    const studentId = req.studentId;
    const student   = await Student.findById(studentId).select("classLevel");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const assignments = await Assignment.find({
      classLevel: student.classLevel,
      status:     "published",
    })
      .populate("teacher", "name")
      .sort({ dueDate: 1 });

    // Attach student's own submission to each assignment
    const assignmentIds = assignments.map(a => a._id);
    const submissions   = await Submission.find({
      assignment: { $in: assignmentIds },
      student:    studentId,
    });

    const subMap = {};
    submissions.forEach(s => { subMap[s.assignment.toString()] = s; });

    const result = assignments.map(a => ({
      assignment: a,
      submission: subMap[a._id.toString()] ?? null,
    }));

    res.json({ success: true, assignments: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/lms/my-assignments/:id  (student portal — single)
export const getMyAssignment = async (req, res) => {
  try {
    const studentId  = req.studentId;
    const assignment = await Assignment.findById(req.params.id).populate("teacher", "name");
    if (!assignment || assignment.status !== "published") {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const student = await Student.findById(studentId).select("classLevel");
    if (student.classLevel !== assignment.classLevel) {
      return res.status(403).json({ message: "Access denied." });
    }

    const submission = await Submission.findOne({ assignment: req.params.id, student: studentId })
      .populate("gradedBy", "name");

    res.json({ success: true, assignment, submission: submission ?? null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/lms/submissions/:id/grade  (teacher only)
export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findById(req.params.id)
      .populate("assignment", "teacher maxScore");

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Only the teacher who owns the assignment can grade
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (submission.assignment.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    if (score !== undefined && (score < 0 || score > submission.assignment.maxScore)) {
      return res.status(400).json({
        message: `Score must be between 0 and ${submission.assignment.maxScore}`,
      });
    }

    submission.score    = score !== undefined ? Number(score) : submission.score;
    submission.feedback = feedback?.trim() ?? submission.feedback;
    submission.status   = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LEARNING RESOURCES
// ─────────────────────────────────────────────────────────────

// GET /api/lms/resources
export const getResources = async (req, res) => {
  try {
    const { classLevel, category, subject } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (subject)  filter.subject  = subject;
    if (classLevel) {
      // Return resources for the specified class OR resources with no class restriction
      filter.$or = [{ classLevel }, { classLevel: "" }];
    }

    const resources = await LearningResource.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, resources, categories: CATEGORIES });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/lms/resources  (teacher/admin)
export const createResource = async (req, res) => {
  try {
    const { title, description, category, subject, classLevel, url } = req.body;
    const createdBy = req.user?._id ?? req.admin?._id;

    if (!title?.trim())    return res.status(400).json({ message: "Title is required" });
    if (!category)         return res.status(400).json({ message: "Category is required" });

    let image = null, attachment = null, attachmentName = null;

    if (req.files?.image?.[0]) {
      const r = await uploadToCloudinary(req.files.image[0].buffer, "lms/resources/images", "image");
      image = r.secure_url;
    }
    if (req.files?.attachment?.[0]) {
      const r = await uploadToCloudinary(req.files.attachment[0].buffer, "lms/resources/files");
      attachment = r.secure_url;
      attachmentName = req.files.attachment[0].originalname;
    }

    const resource = await LearningResource.create({
      title:      title.trim(),
      description:description?.trim() ?? "",
      category,
      subject:    subject?.trim()    ?? "",
      classLevel: classLevel?.trim() ?? "",
      url:        url?.trim()        ?? "",
      image,
      attachment,
      attachmentName,
      createdBy,
    });

    res.status(201).json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/lms/resources/:id
export const updateResource = async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Only creator or admin
    const userId = req.user?._id ?? req.admin?._id;
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (resource.createdBy?.toString() !== userId?.toString()) {
        return res.status(403).json({ message: "You can only edit your own resources." });
      }
    }

    const allowed = ["title","description","category","subject","classLevel","url"];
    allowed.forEach(k => { if (req.body[k] !== undefined) resource[k] = req.body[k]; });

    if (req.files?.image?.[0]) {
      const r = await uploadToCloudinary(req.files.image[0].buffer, "lms/resources/images", "image");
      resource.image = r.secure_url;
    }
    if (req.files?.attachment?.[0]) {
      const r = await uploadToCloudinary(req.files.attachment[0].buffer, "lms/resources/files");
      resource.attachment = r.secure_url;
      resource.attachmentName = req.files.attachment[0].originalname;
    }

    await resource.save();
    res.json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/lms/resources/:id
export const deleteResource = async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const userId = req.user?._id ?? req.admin?._id;
    if (!req.isSuperAdmin && req.user?.role !== "admin") {
      if (resource.createdBy?.toString() !== userId?.toString()) {
        return res.status(403).json({ message: "You can only delete your own resources." });
      }
    }

    await resource.deleteOne();
    res.json({ success: true, message: "Resource deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};