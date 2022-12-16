require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const userController = require("../controllers/userController");
const { upload } = require("../utils/s3");
const bodyParser = require("body-parser");
const router = express.Router();

router.get("/", authChecker, userController.getUserInfo);
router.post(
    "/",
    authChecker,
    upload("/user").any("image"),
    userController.updateProfileImage
);
router.post(
    "/schedule",
    authChecker,

    userController.getSchedule
);

module.exports = router;
