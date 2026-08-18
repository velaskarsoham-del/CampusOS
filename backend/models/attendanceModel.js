const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    attendance_date: { type: String, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { student_id: 1, attendance_date: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

const getAttendanceByDate = async (date) => {
  return Attendance.find({ attendance_date: date })
    .populate("student_id", "student_id first_name last_name department course semester")
    .sort({ "student_id.first_name": 1 })
    .lean();
};

const saveAttendance = async (records) => {
  if (!records || records.length === 0) return;

  const operations = records.map((record) => ({
    updateOne: {
      filter: {
        student_id: record.student_id,
        attendance_date: record.date,
      },
      update: { $set: { status: record.status } },
      upsert: true,
    },
  }));

  return Attendance.bulkWrite(operations);
};

const getAttendanceStats = async (date) => {
  const [stats] = await Attendance.aggregate([
    { $match: { attendance_date: date } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
      },
    },
    { $project: { _id: 0, total: 1, present: 1, absent: 1 } },
  ]);

  return stats || { total: 0, present: 0, absent: 0 };
};

module.exports = {
  getAttendanceByDate,
  saveAttendance,
  getAttendanceStats,
};
