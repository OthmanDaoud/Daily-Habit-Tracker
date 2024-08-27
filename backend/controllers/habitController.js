const Habit = require("../models/Habit");

exports.createHabit = async (req, res) => {
  try {
    const habit = new Habit(req.body);
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCompletionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, completed } = req.body;

    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const existingEntry = habit.completionData.find(
      (entry) => entry.date.toISOString().split("T")[0] === date
    );
    if (existingEntry) {
      existingEntry.completed = completed;
    } else {
      habit.completionData.push({ date: new Date(date), completed });
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHabitProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const filteredData = habit.completionData.filter(
      (entry) =>
        entry.date >= new Date(startDate) && entry.date <= new Date(endDate)
    );

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
