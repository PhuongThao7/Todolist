const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/todolist")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Todo App Running...");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

const bcrypt = require("bcryptjs");
const User = require("./models/User");

app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      username,
      password: hashedPassword,
      role
    });

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Username already exists" });
  }
});

const Task = require("./models/Task");

app.post("/task", async (req, res) => {
  const { title, username } = req.body;

  const user = await User.findOne({ username });

  const task = new Task({
    title,
    user: user._id,
    assignedUsers: [user._id]
  });

  await task.save();
  res.json(task);
});