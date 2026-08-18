const attendanceModel = require("../models/attendanceModel");

const getAttendance = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required" });
  try {
    const records = await attendanceModel.getAttendanceByDate(date);
    res.status(200).json(records.map((record) => ({
      id: record._id,
      student_id: record.student_id?._id,
      attendance_date: record.attendance_date,
      status: record.status,
      student_code: record.student_id?.student_id,
      first_name: record.student_id?.first_name,
      last_name: record.student_id?.last_name,
      department: record.student_id?.department,
      course: record.student_id?.course,
      semester: record.student_id?.semester,
    })));
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
};

const saveAttendance = async (req, res) => {
  const { date, records } = req.body;
  if (!date) return res.status(400).json({ message: "Date is required" });
  if (!Array.isArray(records)) return res.status(400).json({ message: "Attendance records are required" });
  for (const record of records) {
    if (!record.student_id || !record.status) return res.status(400).json({ message: "Each attendance record must contain student_id and status" });
    if (!["Present", "Absent"].includes(record.status)) return res.status(400).json({ message: "Status must be Present or Absent" });
  }
  try {
    await attendanceModel.saveAttendance(records.map((record) => ({ student_id: record.student_id, date, status: record.status })));
    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ message: "Failed to save attendance", error: error.message });
  }
};

const getAttendanceStats = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required" });
  try {
    res.status(200).json(await attendanceModel.getAttendanceStats(date));
  } catch (error) {
    console.error("Attendance stats error:", error);
    res.status(500).json({ message: "Failed to fetch attendance statistics", error: error.message });
  }
};

module.exports = { getAttendance, saveAttendance, getAttendanceStats };
