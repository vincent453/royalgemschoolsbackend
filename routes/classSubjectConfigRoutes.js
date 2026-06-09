import express from "express";
import { protect, protectStaffAdmin, protectAdminOrUser } from "../middleware/authMiddleware.js";
import { setClassConfig, getClassConfig, getAllConfigs } from "../controllers/classSubjectConfigController.js";

const router = express.Router();

router.get("/",    protectStaffAdmin, getAllConfigs);
router.get("/one", protectAdminOrUser, getClassConfig);   // ?classLevel=&session=&term=
router.post("/",   protectStaffAdmin, setClassConfig);

export default router;