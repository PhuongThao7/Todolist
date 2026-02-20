const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/todolist")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/", userRoutes);
app.use("/", taskRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/", userRoutes);
app.use("/", taskRoutes);