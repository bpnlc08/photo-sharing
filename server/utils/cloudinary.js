const cloudinary = require("cloudinary").v2;
require("dotenv").config()
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME ,
    api_key:process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = async (fileBuffer) => {
  try {
    if (!fileBuffer) {
      console.error("No file buffer provided to cloudinaryUpload");
      return null;
    }

    console.log("fileBuffer type:", fileBuffer instanceof Buffer ? "Buffer" : typeof fileBuffer);

    if (!(fileBuffer instanceof Buffer)) {
      console.error("fileBuffer is not a Buffer:", fileBuffer);
      throw new Error("Invalid file buffer: must be a Buffer instance");
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(fileBuffer);
    });

    console.log("File uploaded successfully to Cloudinary\nURL: " + uploadResult.secure_url);
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

module.exports = { cloudinaryUpload };
