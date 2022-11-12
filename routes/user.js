require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/", authChecker, userController.getUserInfo);
router.post("/schedule", authChecker, userController.getSchedule);

module.exports = router;
