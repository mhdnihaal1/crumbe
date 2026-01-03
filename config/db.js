const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongo = await mongoose.connect(
      "mongodb+srv://nihalmuhaednihal_db_user:U6vtXZWQfvREINRl@cluster0.phakguh.mongodb.net/crumbee?retryWrites=true&w=majority"
    );
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
