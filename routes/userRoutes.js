const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");

const router = express.Router();

// create task
router.post("/create", async (req, res) => {
  const { title, userId } = req.body;

  const task = new Task({
    title,
    owner: userId,
    assignedUsers: [{ user: userId }]
  });

  await task.save();
  res.json(task);
});
