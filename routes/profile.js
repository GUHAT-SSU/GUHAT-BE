require("dotenv").config();const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const profileController = require("../controllers/profileController");
const router = express.Router();

router.get("/lecture/my", authChecker, profileController.getMyPost); // (check) 작성한 구인글 상세 조회

module.exports = router;