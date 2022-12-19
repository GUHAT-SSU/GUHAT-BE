require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const projectController = require("../controllers/projectController");
const router = express.Router();

router.post("/create", authChecker, projectController.createProject);
router.post("/lecture/:lectureId/profile/:profileId/review/new", authChecker, projectController.createMemberReview);
router.get("/profile/:profileId", authChecker, projectController.getOthersProfile); // 다른 사람 프로필 조회

module.exports = router;
