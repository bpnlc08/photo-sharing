const mongoose = require("mongoose");
const { Content, User } = require("../schema/schema");

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.roles.creator) {
      return res.status(200).json([]);
    }

    const posts = await Content.find({ creator: userId })
      .populate("creator", "username")
      .populate("people", "username")
      .sort({ uploadDate: -1 });


    const sanitizedPosts = posts.map((post) => ({
      ...post.toObject(),
      people: post.people && post.people.length > 0 ? post.people : [],
    }));

    res.status(200).json(sanitizedPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const editUserPost = async (req, res) => {
  try {
    const { postId } = req.params; 
    const { title, caption, location, people } = req.body; 
    const userId = req.userId; 

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Content.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.creator.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    let peopleArray = [];
    if (people) {
      peopleArray = people.split(",").map((id) => id.trim()).filter((id) => id);
      for (const personId of peopleArray) {
        if (!mongoose.Types.ObjectId.isValid(personId)) {
          return res.status(400).json({ message: `Invalid user ID: ${personId}` });
        }
        const user = await User.findById(personId);
        if (!user) {
          return res.status(404).json({ message: `User not found: ${personId}` });
        }
      }
    }

    post.title = title.trim();
    post.caption = caption !== undefined ? caption.trim() : post.caption;
    post.location = location !== undefined ? location.trim() : post.location;
    post.people = peopleArray.length > 0 ? peopleArray : post.people;

    await post.save();

    const updatedPost = await Content.findById(postId)
      .populate("creator", "username")
      .populate("people", "username");

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserPost = async (req, res) => {
  try {
    const { postId } = req.params; 
    const userId = req.userId; 


    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }


    const post = await Content.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }


    if (post.creator.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }


    await Content.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserPosts, editUserPost, deleteUserPost };
