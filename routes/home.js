require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const homeController = require("../controllers/homeController");
const router = express.Router();

router.get("/lecture", authChecker, homeController.getLecturePosts); // 홈화면 구인글 리스트 조회
router.get("/review", authChecker, homeController.getReviews);


module.exports = router;