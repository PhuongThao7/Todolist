const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");


// Đăng ký user (hash password)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role: role || "normal"
    });

    await user.save();
    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;