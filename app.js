const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

/* ================= CONFIG ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: "todo-secret",
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");

/* ================= CONNECT MONGODB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/todolist")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

/* ================= SCHEMA ================= */
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  fullname: String,
  role: { type: String, enum: ["admin", "normal"], default: "normal" }
});

const TaskSchema = new mongoose.Schema({
  title: String,
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDone: { type: Boolean, default: false },
  doneAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);

/* ================= SEED DATA ================= */
async function seedData() {
  const count = await User.countDocuments();
  if (count === 0) {
    const hash = await bcrypt.hash("123456", 10);

    await User.create({
      username: "admin",
      password: hash,
      fullname: "Admin User",
      role: "admin"
    });

    await User.create({
      username: "user1",
      password: hash,
      fullname: "Nguyễn Văn A"
    });

    await User.create({
      username: "user2",
      password: hash,
      fullname: "Trần Thị B"
    });

    console.log("✅ Seed user xong");
  }
}
seedData();

/* ================= AUTH ================= */
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/");
  next();
}

app.get("/", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.render("login", { error: "Sai tài khoản" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.render("login", { error: "Sai mật khẩu" });

  req.session.user = user;
  res.redirect("/todo");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ================= TODO PAGE ================= */
app.get("/todo", requireLogin, async (req, res) => {
  let tasks;

  if (req.session.user.role === "admin") {
    tasks = await Task.find().populate("assignedUsers");
  } else {
    tasks = await Task.find({
      assignedUsers: req.session.user._id
    }).populate("assignedUsers");
  }

  const users = await User.find();

  const done = tasks.filter(t => t.isDone).length;
  const percent = tasks.length
    ? Math.round((done / tasks.length) * 100)
    : 0;

  res.render("todo", {
    tasks,
    users,
    user: req.session.user,
    percent
  });
});

/* ================= CREATE TASK (ADMIN ONLY) ================= */
app.post("/tasks", requireLogin, async (req, res) => {
  if (req.session.user.role !== "admin") {
    return res.redirect("/todo");
  }

  let assignedUsers = req.body.users;

  if (!assignedUsers) {
    assignedUsers = [req.session.user._id];
  }

  if (!Array.isArray(assignedUsers)) {
    assignedUsers = [assignedUsers];
  }

  await Task.create({
    title: req.body.title,
    assignedUsers
  });

  res.redirect("/todo");
});

/* ================= COMPLETE TASK ================= */
app.post("/tasks/complete/:id", requireLogin, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task.completedBy.includes(req.session.user._id)) {
    task.completedBy.push(req.session.user._id);
  }

  if (task.completedBy.length === task.assignedUsers.length) {
    task.isDone = true;
    task.doneAt = new Date();
  }

  await task.save();
  res.redirect("/todo");
});

/* ================= DELETE TASK (ADMIN ONLY) ================= */
app.post("/tasks/delete/:id", requireLogin, async (req, res) => {
  if (req.session.user.role !== "admin") {
    return res.redirect("/todo");
  }

  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/todo");
});

/* ================= API ================= */

/* ✅ API: tất cả task (admin: tất cả, user: task của mình) */
app.get("/api/tasks", requireLogin, async (req, res) => {
  let tasks;

  if (req.session.user.role === "admin") {
    tasks = await Task.find().populate("assignedUsers");
  } else {
    tasks = await Task.find({
      assignedUsers: req.session.user._id
    }).populate("assignedUsers");
  }

  res.json(tasks);
});

/* ✅ API: TASK HÔM NAY */
app.get("/api/tasks/today", requireLogin, async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let query = { createdAt: { $gte: start, $lte: end } };

  if (req.session.user.role !== "admin") {
    query.assignedUsers = req.session.user._id;
  }

  const tasks = await Task.find(query).populate("assignedUsers");
  res.json(tasks);
});

/* ✅ API: TASK HỌ NGUYỄN */
app.get("/api/tasks/nguyen", requireLogin, async (req, res) => {
  const users = await User.find({
    fullname: { $regex: /^Nguyễn/i }
  });

  const userIds = users.map(u => u._id);

  let query = { assignedUsers: { $in: userIds } };

  if (req.session.user.role !== "admin") {
    query.assignedUsers = req.session.user._id;
  }

  const tasks = await Task.find(query).populate("assignedUsers");
  res.json(tasks);
});

/* ================= START ================= */
app.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});