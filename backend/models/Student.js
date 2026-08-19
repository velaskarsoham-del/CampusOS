const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    student_id: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    course: { type: String, trim: true },
    semester: { type: Number, min: 1, max: 12 },
    admission_year: { type: Number },
  },
  { timestamps: true }
);

studentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Student", studentSchema);
