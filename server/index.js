const connectDb = require("./database/connect");
const express = require("express");
const cors = require("cors");
const authroute = require("./routes/authroutes");
const verifyToken = require("./middlewares/tokenverify");
const upload = require("./middlewares/multer");
const profileroute = require("./routes/profileRoute");
const postroute = require("./routes/userPostRoute");
const ratingCommentRoute = require("./routes/ratingCommentRoutes");
const contentRoutes = require("./routes/contentroutes"); 
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8000; 

app.use(cors());
app.use(express.json());
app.set("trust proxy", 1)
connectDb();

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
app.use("/user", authroute);
app.use("/api/creator", contentRoutes); 
app.use("/api/user/", profileroute);
app.use("/api/user/", postroute);
app.use("/creator/upload", verifyToken, upload.single("media"), require("./controller/contentController").uploadContent); 
app.use("/api/", ratingCommentRoute);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
