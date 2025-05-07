const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true,
    index: true, 
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
  },
  roles: {
    consumer: {
      type: Boolean,
      default: true,
    },
    creator: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const contentSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  caption: {
    type: String,
  },
  location: {
    type: String,
    index: true,
  },
  people: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
    },
  ],
  mediaUrl: {
    type: String,
    required: true, 
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    index: true, 
  },
});
const commentSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  commentText: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ratingSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, 
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


ratingSchema.index({ contentId: 1, user: 1 }, { unique: true });


const User = mongoose.model("User", userSchema);
const Content = mongoose.model("Content", contentSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Rating = mongoose.model("Rating", ratingSchema);

module.exports = { User, Content, Comment, Rating };
