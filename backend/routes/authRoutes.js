const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/user");

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// =====================================================
// SIGNUP
// POST /api/auth/signup
// =====================================================

router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    role,
  } = req.body;

  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message:
        "Name, email, password and account type are required",
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      message: "Please enter a valid full name",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must contain at least 6 characters",
    });
  }

  // Public signup only allows student and faculty
  if (role !== "student" && role !== "faculty") {
    return res.status(400).json({
      message: "Invalid account type",
    });
  }

  try {
    // -------------------------------------------------
    // CHECK EXISTING EMAIL
    // -------------------------------------------------

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -------------------------------------------------
    // CREATE USER
    // -------------------------------------------------

    const user = await User.create({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Account created successfully",

      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // MongoDB duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create account",
    });
  }
});

module.exports = router;