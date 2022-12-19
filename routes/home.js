require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const homeController = require("../controllers/homeController");
const router = express.Router();

router.get("/user", authChecker, homeController.getUserInfo); // 홈화면 유저 조회
router.get("/lecture", authChecker, homeController.getLecturePosts); // 홈화면 구인글 리스트 조회
router.get("/review", authChecker, homeController.getReviews); // 홈화면 리뷰 조회
router.get("/all", authChecker, homeController.getAllMyPosts); // 내가 작성한 모든 글 조회


module.exports = router;