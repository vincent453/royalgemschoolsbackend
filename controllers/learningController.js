import LearningAssignment from "../models/learningAssignmentModel.js";
import LearningSubmission from "../models/learningSubmissionModel.js";
import LearningResource from "../models/learningResourceModel.js";
import Student from "../models/studentModel.js";

export const getAssignments = async (req, res) => {
  try {
    const { studentId, classLevel, subject } = req.query;
    const query = {};

    if (classLevel) query.classLevel = classLevel;
    if (subject) query.subject = subject;

    const assignments = await LearningAssignment.find(query)
      .sort({ dueDate: 1 })
      .populate("createdBy", "fullName email")
      .lean();

    if (studentId) {
      const student = await Student.findById(studentId).lean();
      const filtered = assignments.filter((assignment) => {
        if (assignment.targetType === "students") {
          return assignment.targetStudents?.some((id) => id.toString() === studentId);
        }
        return assignment.classLevel === student?.classLevel;
      });
      return res.json(filtered);
    }

    return res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const assignment = await LearningAssignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await LearningAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    await LearningAssignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.query;
    const query = {};

    if (assignmentId) query.assignment = assignmentId;
    if (studentId) query.student = studentId;

    const submissions = await LearningSubmission.find(query)
      .populate("assignment", "title subject dueDate")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const submission = await LearningSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await LearningSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const { classLevel, subject } = req.query;
    const query = { isPublished: true };

    if (classLevel) query.classLevel = classLevel;
    if (subject) query.subject = subject;

    const resources = await LearningResource.find(query).sort({ createdAt: -1 }).lean();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const resource = await LearningResource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await LearningResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
