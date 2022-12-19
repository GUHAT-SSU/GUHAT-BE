require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const lectureController = require("../controllers/lectureController");
const { upload } = require("../utils/s3");
const multer = require("multer");
const router = express.Router();

router.get("/", authChecker, lectureController.getLecture);

// 과목 페이지에 있는 것들 : 과목별 리뷰, 과목별 모집글
router.post(
    "/:lectureId/review/new",
    authChecker,
    lectureController.createReview
);

router.post(
    "/:lectureId/review/new/file",
    authChecker,
    upload("review").any(),
    lectureController.addReviewFile
);

router.get(
    "/:lectureId/review/validation",
    authChecker,
    lectureController.postReviewValidation
);

router.get(
    "/:lectureId/recruits",
    authChecker,
    lectureController.getRecruitPosts
);
router.get(
    "/:lectureId/review/all",
    authChecker,
    lectureController.getReviewAllPosts
);
router.get(
    "/:lectureId/review/:reviewId",
    authChecker,
    lectureController.getReviewDetail
);

router.post(
    "/:lectureId/review/:reviewId/comment",
    authChecker,
    lectureController.createReviewComment
);

router.get(
    "/:lectureId/review/:reviewId/comment",
    authChecker,
    lectureController.getReviewComments
);
module.exports = router;
