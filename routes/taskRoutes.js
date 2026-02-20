const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");


// CREATE TASK
router.post("/task", async (req, res) => {
  try {
    const { title, username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const task = new Task({
      title,
      createdBy: user._id,
      assignedUsers: [user._id]
    });

    await task.save();
    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET ALL TASKS
router.get("/tasks", async (req, res) => {
  const tasks = await Task.find().populate("createdBy assignedUsers completedBy");
  res.json(tasks);
});


// GET TASK BY USERNAME
router.get("/tasks/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const tasks = await Task.find({ createdBy: user._id });
  res.json(tasks);
});


// TASK TODAY
router.get("/tasks/today", async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const tasks = await Task.find({
    createdAt: { $gte: today }
  });

  res.json(tasks);
});


// TASK NOT DONE
router.get("/tasks/notdone", async (req, res) => {
  const tasks = await Task.find({ isDone: false });
  res.json(tasks);
});


// TASK USER HỌ NGUYỄN
router.get("/tasks/nguyen", async (req, res) => {
  const users = await User.find({ username: /^Nguyễn/i });
  const userIds = users.map(u => u._id);

  const tasks = await Task.find({ createdBy: { $in: userIds } });
  res.json(tasks);
});


// COMPLETE TASK (Level 3)
router.post("/task/:id/complete", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  const task = await Task.findById(req.params.id);

  if (!user || !task) {
    return res.status(404).json({ message: "Not found" });
  }

  if (!task.completedBy.includes(user._id)) {
    task.completedBy.push(user._id);
  }

  if (task.completedBy.length === task.assignedUsers.length) {
    task.isDone = true;
    task.doneAt = new Date();
  }

  await task.save();
  res.json(task);
});

module.exports = router;