const { User } = require("../schema/schema");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username _id"); // Fetch only username and _id
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { getAllUsers };
