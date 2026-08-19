const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const User = require("../models/user");
const Student = require("../models/Student");
const Teacher = require("../models/teacherModel");

// ======================================================
// LOGIN
// ======================================================

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

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
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
    console.error(error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// ======================================================
// SIGNUP
// ======================================================

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Please fill all required fields.",
    });
  }

  if (role !== "student" && role !== "faculty") {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  try {
    // Check existing email
    const existing = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existing) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    // Split name
    const names = name.trim().split(" ");

    const first_name = names[0];

    const last_name =
      names.length > 1 ? names.slice(1).join(" ") : "";

    // ==========================================
    // STUDENT
    // ==========================================

    if (role === "student") {
      const count = await Student.countDocuments();

      await Student.create({
        userId: user._id,
        student_id: `STU${String(count + 1).padStart(3, "0")}`,
        first_name,
        last_name,
        email: user.email,
        phone: "",
        department: "",
        course: "",
        semester: null,
        admission_year: null,
      });
    }

    // ==========================================
    // FACULTY
    // ==========================================

    if (role === "faculty") {
      const count = await Teacher.countDocuments();

      await Teacher.create({
        userId: user._id,
        teacher_id: `TCH${String(count + 1).padStart(3, "0")}`,
        first_name,
        last_name,
        email: user.email,
        phone: "",
        department: "",
        subject: "",
        qualification: "",
        joining_year: null,
      });
    }

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
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    return res.status(500).json({
      message: "Signup failed.",
    });
  }
});

module.exports = router;