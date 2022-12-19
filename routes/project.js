require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const projectController = require("../controllers/projectController");
const router = express.Router();

router.post("/create", authChecker, projectController.createProject);
router.post("/lecture/:lectureId/profile/:profileId/review/new", authChecker, projectController.createMemberReview);

module.exports = router;
