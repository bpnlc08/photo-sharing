const mongoose = require("mongoose");
const { Content, User } = require("../schema/schema.js");
const { cloudinaryUpload } = require("../utils/cloudinary.js");
const redis = require("../utils/redis.js"); 

const uploadContent = async (req, res) => {
  try {
    const { title, caption, location, people } = req.body;
    const file = req.file; 
    const userId = req.userId; 

    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!file) {
      return res.status(400).json({ error: "Media file is required" });
    }

   
    if (location && location.trim().length < 2) {
      return res.status(400).json({ error: "Location must be at least 2 characters long if provided" });
    }


    const peopleArray = people ? people.split(",").map((id) => id.trim()).filter((id) => id) : [];
    for (const personId of peopleArray) {
      if (!mongoose.Types.ObjectId.isValid(personId)) {
        return res.status(400).json({ error: `Invalid user ID: ${personId}` });
      }
      const user = await User.findById(personId);
      if (!user) {
        return res.status(404).json({ error: `User not found: ${personId}` });
      }
    }


    const mediaUrl = await cloudinaryUpload(file.buffer);
    if (!mediaUrl) {
      return res.status(500).json({ error: "Failed to upload file to Cloudinary" });
    }


    const content = new Content({
      creator: userId,
      title: title.trim(),
      caption: caption ? caption.trim() : "",
      location: location ? location.trim() : "",
      people: peopleArray, 
      mediaUrl,
      uploadDate: Date.now(),
    });

    
    await content.save();

   
    const populatedContent = await Content.findById(content._id)
      .populate("creator", "username")
      .populate("people", "username");

    res.status(201).json({ message: "Content uploaded successfully", content: populatedContent });
  } catch (error) {
    console.error("Error uploading content:", error);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
};


const sendContent = async (req, res) => {
  try {

    const content = await Content.find()
      .sort({ uploadDate: -1 }) 
      .populate("creator", "username")
      .populate("people", "username");


    const sanitizedContent = content.map((item) => ({
      ...item.toObject(),
      people: item.people && item.people.length > 0 ? item.people : [],
    }));


    res.status(200).json(sanitizedContent);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Server error while fetching content" });
  }
};


const searchContentByTitle = async (req, res) => {
  try {
    const { title } = req.query;


    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "A valid title query parameter is required" });
    }

    const searchTerm = title.trim();
    const cacheKey = `search:title:${searchTerm.toLowerCase()}`; 


    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for search term: ${searchTerm}`);
      return res.status(200).json(JSON.parse(cachedResult));
    }


    console.log(`Cache miss for search term: ${searchTerm}`);
    const content = await Content.find({
      title: { $regex: searchTerm, $options: "i" }, 
    })
      .sort({ uploadDate: -1 }) 
      .populate("creator", "username")
      .populate("people", "username");


    const sanitizedContent = content.map((item) => ({
      ...item.toObject(),
      people: item.people && item.people.length > 0 ? item.people : [],
    }));


    await redis.set(cacheKey,  JSON.stringify(sanitizedContent));
    console.log(`Cached search results for term: ${searchTerm}`);


    res.status(200).json(sanitizedContent);
  } catch (error) {
    console.error("Error searching content by title:", error);
    res.status(500).json({ error: "Server error while searching content" });
  }
};

module.exports = { uploadContent, sendContent, searchContentByTitle };
