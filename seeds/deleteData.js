const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });
const User = require("../models/User");
const Campground = require("../models/Campground");
const Booking = require("../models/Booking");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

// Delete all data
const deleteAllData = async () => {
  try {
    await connectDB();

    console.log("Deleting all data...");

    await Booking.deleteMany({});
    console.log("✓ Deleted all bookings");

    await Campground.deleteMany({});
    console.log("✓ Deleted all campgrounds");

    await User.deleteMany({});
    console.log("✓ Deleted all users");

    console.log("\n✓ All data deleted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting data:", err);
    process.exit(1);
  }
};

// Run delete script
deleteAllData();
