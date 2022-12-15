require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const profileController = require("../controllers/profileController");
const { upload } = require("../utils/s3");
const router = express.Router();

router.get("/", authChecker, profileController.getProfile);
router.get("/lecture/my", authChecker, profileController.getMyPost); // (check) 작성한 구인글 상세 조회
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

module.exports = router;
