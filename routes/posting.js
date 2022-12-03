require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();

router.post("/posting/lecture", authChecker, postController.postPosting);
router.post("/posting/lecture/apply", authChecker, postController.postApply);

router.get("/posting/lecture", authChecker, postController.getAllPosting); // 구인글 리스트 조회
router.get("/posting/lecture", authChecker, postController.getMyPosting); // 작성한 구인글 상세 조회
router.get("/posting/lecture/:postId", authChecker, postController.getPosting); // 구인글 상세 조회
router.get("/posting/lecture/member", authChecker, postController.getAllAppliers); // 작성한 구인글 지원자 리스트 조회
router.get("/posting/lecture/apply", authChecker, postController.getMyApplyPosting); // 내가 지원한 구인글 리스트 조회

router.patch("/posting/lecture/member", authChecker, postController.updateApplyStatus); // 구인글 지원상태 변경



module.exports = router;