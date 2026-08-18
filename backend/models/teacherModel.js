const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacher_id: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    subject: { type: String, trim: true },
    qualification: { type: String, trim: true },
    joining_year: { type: Number, min: 1950, max: 2100 },
  },
  { timestamps: true }
);

teacherSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Teacher", teacherSchema);
