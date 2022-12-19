require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();

console.log("conneceted router posting");
router.post("/lecture", authChecker, postController.createPost); // 구인글 작성
router.post("/lecture/apply", authChecker, postController.apply); // 구인글 지원
router.post("/lecture/member", authChecker, postController.updateApplyStatus); // 구인글 지원상태 변경(지원 받기)

router.get("/lecture/:postId", authChecker, postController.getPosting); // 구인글 상세 조회
router.get("/lectures", authChecker, postController.getAllPost); // 구인글 리스트 조회
router.get("/review/all", authChecker, postController.getAllReview); // 팀플 리뷰 리스트 전체 조회


module.exports = router;
