const { default: mongoose } = require("mongoose");
const { User } = require("../schema/schema");
const redis = require("../utils/redis.js"); 

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const cacheKey = `user:profile:${userId}`; 

    const cachedResult = await redis.get(cacheKey).catch((err) => {
      console.error("Redis get error:", err);
      return null;
    });

    if (cachedResult) {
      console.log(`Cache hit for user profile: ${userId}`);
      return res.status(200).json(JSON.parse(cachedResult));
    }

    console.log(`Cache miss for user profile: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await redis.set(cacheKey,  JSON.stringify(userProfile)).catch((err) => {
      console.error("Redis set error:", err);
    });
    console.log(`Cached user profile for user: ${userId}`);

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getUserProfile;
