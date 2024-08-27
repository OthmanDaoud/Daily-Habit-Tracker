const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mongo-task:4E35VbfqK5rxKX44@daily-habit-tracker.cwvsicj.mongodb.net/?retryWrites=true&w=majority&appName=Daily-Habit-Tracker",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
