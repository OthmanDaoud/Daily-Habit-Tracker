const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const habitRoutes = require("./routes/habitRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/habits", habitRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
