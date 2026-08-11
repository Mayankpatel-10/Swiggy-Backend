const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/swiggy";
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to ${uri.split("@").pop()}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
