const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      email: req.user.email,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.json(student);
  } catch (error) {
    console.error("Student profile error:", error);

    res.status(500).json({
      message: "Failed to load student profile",
    });
  }
});

module.exports = router;