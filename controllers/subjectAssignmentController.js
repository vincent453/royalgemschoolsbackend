import SubjectAssignment from "../models/subjectAssignmentModel.js";
import User from "../models/userModel.js";

// Admin assigns a subject teacher to subject + classes
// POST /api/assignments
export const createAssignment = async (req, res) => {
  try {
    const { teacherId, subject, classLevels, session } = req.body;

    if (!teacherId || !subject || !classLevels?.length || !session) {
      return res.status(400).json({ message: "teacherId, subject, classLevels and session are required" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || !["subject_teacher", "teacher"].includes(teacher.role)) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Upsert — update if exists, create if not
    const assignment = await SubjectAssignment.findOneAndUpdate(
      { teacher: teacherId, subject, session },
      { classLevels, isActive: true },
      { upsert: true, new: true }
    );

    // Sync back to user record
    await User.findByIdAndUpdate(teacherId, {
    subject: subject,   // ✅ correct field name
    $addToSet: { assignedClasses: { $each: classLevels } },
  });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/assignments — all assignments (admin)
export const getAllAssignments = async (req, res) => {
  try {
    const { session } = req.query;
    const filter = session ? { session } : {};
    const assignments = await SubjectAssignment.find(filter)
      .populate("teacher", "name email role")
      .sort({ subject: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/assignments/my — subject teacher's own assignments
export const getMyAssignments = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { session } = req.query;
    const filter = { teacher: teacherId, isActive: true };
    if (session) filter.session = session;

    const assignments = await SubjectAssignment.find(filter);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/assignments/:id — admin removes assignment
export const deleteAssignment = async (req, res) => {
  try {
    await SubjectAssignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Assignment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};