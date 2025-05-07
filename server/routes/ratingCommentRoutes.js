const express = require("express");
const router = express.Router();
const { addRating, addComment, getRatingsAndComments, deleteComment } = require("../controller/ratingCommentController");
const verifyToken = require("../middlewares/tokenverify");


router.post("/rating", verifyToken, addRating);
router.post("/comment", verifyToken, addComment);
router.get("/ratings-comments/:contentId", getRatingsAndComments);
router.delete("/comment/:commentId", verifyToken, deleteComment);

module.exports = router;
