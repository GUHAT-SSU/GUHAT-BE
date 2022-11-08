require("dotenv").config();
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/token", authController.getToken);

module.exports = router;
