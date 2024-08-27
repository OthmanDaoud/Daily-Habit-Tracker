const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "daily",
  },
  completionData: [
    {
      date: { type: Date, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Habit", HabitSchema);
