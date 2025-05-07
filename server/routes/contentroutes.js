const express = require("express");
const {sendContent,searchContentByTitle} = require("../controller/contentController")
const router = express.Router();
router.get("/content", sendContent);
router.get("/content/search", searchContentByTitle); 

module.exports = router;
