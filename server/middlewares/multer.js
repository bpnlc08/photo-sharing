const multer = require("multer");


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
   
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/mpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed (JPEG, PNG, MP4, MPEG)"));
    }
  },
});

module.exports = upload;
