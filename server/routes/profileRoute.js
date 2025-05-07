const express = require("express");
const router = express.Router();
const userProfile = require("../controller/userProfileController");
const verifyToken = require("../middlewares/tokenverify");

router.get("/profile/:userId",verifyToken, userProfile);

module.exports = router;

