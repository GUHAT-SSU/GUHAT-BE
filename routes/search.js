require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const searchController = require("../controllers/searchController");
const router = express.Router();

router.get("/", authChecker, searchController.getSeachResult); // (check) 작성한 구인글 상세 조회

module.exports = router;
