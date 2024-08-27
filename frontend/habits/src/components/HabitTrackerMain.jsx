import React, { useState, useEffect } from "react";
import axios from "axios";

const HabitTrackerMain = () => {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    category: "",
    tags: [],
    frequency: "daily",
  });
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    filterHabits();
  }, [habits, selectedCategory, selectedTag, selectedFrequency, searchTerm]);

  const fetchHabits = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/habits");
      setHabits(response.data);
      extractCategoriesAndTags(response.data);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const extractCategoriesAndTags = (habits) => {
    const uniqueCategories = [
      ...new Set(habits.map((habit) => habit.category)),
    ];
    const uniqueTags = [...new Set(habits.flatMap((habit) => habit.tags))];
    setCategories(uniqueCategories);
    setTags(uniqueTags);
  };

  const filterHabits = () => {
    let filtered = habits;

    if (selectedCategory) {
      filtered = filtered.filter(
        (habit) => habit.category === selectedCategory
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((habit) => habit.tags.includes(selectedTag));
    }

    if (selectedFrequency) {
      filtered = filtered.filter(
        (habit) => habit.frequency === selectedFrequency
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (habit) =>
          habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          habit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHabits(filtered);
  };

  const handleAddHabit = async () => {
    try {
      await axios.post("http://localhost:5000/api/habits", newHabit);
      setIsAddModalOpen(false);
      setNewHabit({
        name: "",
        description: "",
        category: "",
        tags: [],
        frequency: "daily",
      });
      fetchHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const handleCompleteHabit = async (id, completed) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await axios.put(`http://localhost:5000/api/habits/${id}/complete`, {
        date: today,
        completed,
      });
      fetchHabits();
    } catch (error) {
      console.error("Error updating habit completion:", error);
    }
  };

  const fetchHabitProgress = async (habitId) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Fetch last 30 days of data

      const response = await axios.get(
        `http://localhost:5000/api/habits/${habitId}/progress`,
        {
          params: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        }
      );
      setProgressData(response.data);
    } catch (error) {
      console.error("Error fetching habit progress:", error);
    }
  };

  const calculateStreak = (data) => {
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].completed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        break;
      }
    }

    return { current: currentStreak, max: maxStreak };
  };

  const handleEditHabit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/habits/${editingHabit._id}`,
        editingHabit
      );
      setEditingHabit(null);
      fetchHabits();
    } catch (error) {
      console.error("Error editing habit:", error);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/habits/${id}`);
      fetchHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Habit Tracker</h1>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search habits..."
          className="p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={selectedFrequency}
          onChange={(e) => setSelectedFrequency(e.target.value)}
        >
          <option value="">All Frequencies</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Add Habit Button */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        onClick={() => setIsAddModalOpen(true)}
      >
        Add New Habit
      </button>

      {/* Habit List */}
      <div className="space-y-4">
        {filteredHabits.map((habit) => (
          <div key={habit._id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{habit.name}</h2>
              <div>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => setEditingHabit(habit)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteHabit(habit._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-2">{habit.description}</p>
            <p className="text-sm text-gray-500 mb-1">
              Category: {habit.category}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Frequency: {habit.frequency}
            </p>
            <div className="flex gap-2 mb-4">
              {habit.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={
                  habit.completionData.find(
                    (entry) =>
                      entry.date.split("T")[0] ===
                      new Date().toISOString().split("T")[0]
                  )?.completed || false
                }
                onChange={(e) =>
                  handleCompleteHabit(habit._id, e.target.checked)
                }
                className="mr-2"
              />
              <span>Mark as completed for today</span>
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
              onClick={() => {
                setSelectedHabit(habit);
                fetchHabitProgress(habit._id);
              }}
            >
              View Progress
            </button>
          </div>
        ))}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Habit</h2>
            <input
              type="text"
              placeholder="Habit Name"
              className="w-full p-2 mb-2 border rounded"
              value={newHabit.name}
              onChange={(e) =>
                setNewHabit({ ...newHabit, name: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 mb-2 border rounded"
              value={newHabit.description}
              onChange={(e) =>
                setNewHabit({ ...newHabit, description: e.target.value })
              }
            ></textarea>
            <input
              type="text"
              placeholder="Category"
              className="w-full p-2 mb-2 border rounded"
              value={newHabit.category}
              onChange={(e) =>
                setNewHabit({ ...newHabit, category: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              className="w-full p-2 mb-2 border rounded"
              value={newHabit.tags.join(", ")}
              onChange={(e) =>
                setNewHabit({
                  ...newHabit,
                  tags: e.target.value.split(",").map((tag) => tag.trim()),
                })
              }
            />
            <select
              className="w-full p-2 mb-4 border rounded"
              value={newHabit.frequency}
              onChange={(e) =>
                setNewHabit({ ...newHabit, frequency: e.target.value })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleAddHabit}
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Habit</h2>
            <input
              type="text"
              placeholder="Habit Name"
              className="w-full p-2 mb-2 border rounded"
              value={editingHabit.name}
              onChange={(e) =>
                setEditingHabit({ ...editingHabit, name: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 mb-2 border rounded"
              value={editingHabit.description}
              onChange={(e) =>
                setEditingHabit({
                  ...editingHabit,
                  description: e.target.value,
                })
              }
            ></textarea>
            <input
              type="text"
              placeholder="Category"
              className="w-full p-2 mb-2 border rounded"
              value={editingHabit.category}
              onChange={(e) =>
                setEditingHabit({ ...editingHabit, category: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              className="w-full p-2 mb-2 border rounded"
              value={editingHabit.tags.join(", ")}
              onChange={(e) =>
                setEditingHabit({
                  ...editingHabit,
                  tags: e.target.value.split(",").map((tag) => tag.trim()),
                })
              }
            />
            <select
              className="w-full p-2 mb-4 border rounded"
              value={editingHabit.frequency}
              onChange={(e) =>
                setEditingHabit({ ...editingHabit, frequency: e.target.value })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditingHabit(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleEditHabit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Progress Modal */}
      {selectedHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-3/4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {selectedHabit.name} Progress
            </h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Last 30 Days</h3>
              <div className="flex flex-wrap gap-1">
                {progressData.map((entry, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.completed ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={`${new Date(entry.date).toLocaleDateString()}: ${
                      entry.completed ? "Completed" : "Not Completed"
                    }`}
                  >
                    {entry.completed ? "✓" : "✗"}
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Streaks</h3>
              <p>
                Current Streak: {calculateStreak(progressData).current} days
              </p>
              <p>Longest Streak: {calculateStreak(progressData).max} days</p>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedHabit(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTrackerMain;
