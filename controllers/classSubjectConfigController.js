import ClassSubjectConfig from "../models/classSubjectConfigModel.js";

// POST /api/class-config — admin sets required subjects for a class
export const setClassConfig = async (req, res) => {
  try {
    const { classLevel, session, term, requiredSubjects } = req.body;

    const config = await ClassSubjectConfig.findOneAndUpdate(
      { classLevel, session, term },
      { requiredSubjects },
      { upsert: true, new: true }
    );

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/class-config?classLevel=JSS1&session=2024/2025&term=1st Term
export const getClassConfig = async (req, res) => {
  try {
    const { classLevel, session, term } = req.query;
    const config = await ClassSubjectConfig.findOne({ classLevel, session, term });
    res.json(config || { requiredSubjects: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/class-config/all — admin views all configs
export const getAllConfigs = async (req, res) => {
  try {
    const configs = await ClassSubjectConfig.find().sort({ classLevel: 1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};