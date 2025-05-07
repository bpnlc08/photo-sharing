const { Content, Comment, Rating } = require("../schema/schema");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");


const addRating = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { contentId, rating } = req.body;
  const userId = req.userId;

  if (!contentId || !rating) {
    return res.status(400).json({ message: "Content ID and rating are required." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
  }

  const content = await Content.findById(contentId).populate("creator");
  if (!content) {
    return res.status(404).json({ message: "Content not found." });
  }

  if (content.creator._id.toString() === userId.toString()) {
    return res.status(403).json({ message: "You cannot rate your own content." });
  }

  const existingRating = await Rating.findOne({ contentId, user: userId });
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.date = Date.now();
    await existingRating.save();
    return res.status(200).json({ message: "Rating updated successfully.", rating: existingRating });
  }

  const newRating = new Rating({
    contentId,
    user: userId,
    rating,
  });
  await newRating.save();

  res.status(201).json({ message: "Rating added successfully.", rating: newRating });
});


const addComment = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { contentId, commentText } = req.body;
  const userId = req.userId;

  if (!contentId || !commentText) {
    return res.status(400).json({ message: "Content ID and comment text are required." });
  }

  if (commentText.trim().length === 0) {
    return res.status(400).json({ message: "Comment cannot be empty." });
  }

  if (commentText.length > 500) {
    return res.status(400).json({ message: "Comment cannot exceed 500 characters." });
  }

  const content = await Content.findById(contentId).populate("creator");
  if (!content) {
    return res.status(404).json({ message: "Content not found." });
  }

  if (content.creator._id.toString() === userId.toString()) {
    return res.status(403).json({ message: "You cannot comment on your own content." });
  }

  const newComment = new Comment({
    contentId,
    user: userId,
    commentText,
  });
  await newComment.save();

  const populatedComment = await Comment.findById(newComment._id).populate("user", "username");
  res.status(201).json({ message: "Comment added successfully.", comment: populatedComment });
});


const getRatingsAndComments = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!contentId) {
    return res.status(400).json({ message: "Content ID is required." });
  }

  const content = await Content.findById(contentId);
  if (!content) {
    return res.status(404).json({ message: "Content not found." });
  }

  const ratings = await Rating.find({ contentId }).populate("user", "username");
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;


  const comments = await Comment.find({ contentId })
    .populate("user", "username")
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);


  const userRatings = await Rating.find({ contentId }).select("user rating");
  const userRatingMap = userRatings.reduce((map, rating) => {
    map[rating.user.toString()] = rating.rating;
    return map;
  }, {});


  const commentsWithRatings = comments.map(comment => ({
    ...comment.toObject(),
    userRating: userRatingMap[comment.user._id.toString()] || null,
  }));

  const totalComments = await Comment.countDocuments({ contentId });

  let userRating = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, "12345");
      const userId = decoded.userId;
      const rating = await Rating.findOne({ contentId, user: userId });
      if (rating) {
        userRating = rating.rating;
      }
    } catch (err) {
      console.error("Error verifying token for user rating:", err.message);
    }
  }

  res.status(200).json({
    averageRating: averageRating.toFixed(1),
    ratingsCount: ratings.length,
    userRating,
    comments: commentsWithRatings,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    },
  });
});


const deleteComment = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { commentId } = req.params;
  const userId = req.userId;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required." });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found." });
  }

  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You can only delete your own comments." });
  }

  await Comment.findByIdAndDelete(commentId);
  res.status(200).json({ message: "Comment deleted successfully." });
});

module.exports = {
  addRating,
  addComment,
  getRatingsAndComments,
  deleteComment,
};
