const Redis = require("ioredis");
require("dotenv").config()
const redis = new Redis({
    port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST, 
  username: "default", 
  password: process.env.REDIS_PASSWORD,
  db: 0, 
});
redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redis;
