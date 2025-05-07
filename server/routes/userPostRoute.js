const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/tokenverify");
const { getUserPosts, editUserPost, deleteUserPost } = require("../controller/userPostController");
const { getAllUsers } = require("../controller/userController");

router.get("/posts/:userId", verifyToken, getUserPosts); 
router.put("/posts/:postId", verifyToken, editUserPost);
router.delete("/posts/:postId", verifyToken, deleteUserPost);
router.get("/all", verifyToken, getAllUsers);

module.exports = router;
