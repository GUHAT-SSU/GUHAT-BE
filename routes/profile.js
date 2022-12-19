require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const profileController = require("../controllers/profileController");
const { upload } = require("../utils/s3");
const router = express.Router();

router.get("/", authChecker, profileController.getProfile);
router.get("/lecture/my", authChecker, profileController.getMyPost); // 참여 이력 조회
router.get("/review/my", authChecker, profileController.getMyReview); // 작성한 리뷰 조회
router.get("/:profileId/review", authChecker, profileController.getMemberReview); // 멤버 리뷰 조회

router.patch("/intro", authChecker, profileController.updateProfileIntro);
router.patch("/detail", authChecker, profileController.updateProfileDetail);
router.patch("/mode", authChecker, profileController.updateProfileMode);
router.post(
    "/file",
    authChecker,
    upload("profile").array("profile"),
    profileController.addProfileFile
);
router.post("/file/delete", authChecker, profileController.deleteProfileFile);
router.post("/:profileId/like", authChecker, profileController.createProfileLike);

module.exports = router;
