const express = require("express");

const router = express.Router();

const attendanceController =
  require("../controllers/attendanceController");


// GET attendance for a date

router.get(
  "/",
  attendanceController.getAttendance
);


// GET attendance statistics

router.get(
  "/stats",
  attendanceController.getAttendanceStats
);


// SAVE attendance

router.post(
  "/",
  attendanceController.saveAttendance
);


module.exports = router;