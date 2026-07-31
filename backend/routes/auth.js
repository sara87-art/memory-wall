import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });

    if (exists) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      "mySecretKey",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;