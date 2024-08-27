const express = require("express");
const router = express.Router();
const habitController = require("../controllers/habitController");

router.post("/", habitController.createHabit);
router.get("/", habitController.getHabits);
router.put("/:id", habitController.updateHabit);
router.put("/:id/complete", habitController.updateCompletionStatus);
router.get("/:id/progress", habitController.getHabitProgress);
router.delete("/:id", habitController.deleteHabit);

module.exports = router;
