require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const lectureController = require("../controllers/lectureController");
const router = express.Router();
// 과목 페이지에 있는 것들 : 과목별 리뷰, 과목별 모집글 
router.post("/review/new", authChecker, lectureController.createReview);

module.exports = router;