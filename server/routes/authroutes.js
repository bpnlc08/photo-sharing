const express = require('express');
const {signupController,signinController} = require("../controller/authController");
const router = express.Router();

router.post("/signup",signupController);
router.post("/signin",signinController);

module.exports = router;

