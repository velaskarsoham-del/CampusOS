const Student = require("../models/Student");

const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(
      students.map((student) => ({ ...student, id: student._id }))
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ ...student, id: student._id });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(400).json({ message: "Invalid student ID" });
  }
};

const createStudent = async (req, res) => {
  const { student_id, first_name, last_name, email, phone, department, course, semester, admission_year } = req.body;
  if (!student_id || !first_name || !last_name) {
    return res.status(400).json({ message: "Student ID, first name and last name are required" });
  }
  try {
    const student = await Student.create({ student_id, first_name, last_name, email, phone, department, course, semester, admission_year });
    res.status(201).json({ message: "Student created successfully", studentId: student._id, student: { ...student.toObject(), id: student._id } });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error.code === 11000) return res.status(409).json({ message: "Student ID or email already exists" });
    res.status(500).json({ message: "Failed to create student", error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student updated successfully", student: { ...student, id: student._id } });
  } catch (error) {
    console.error("Error updating student:", error);
    if (error.code === 11000) return res.status(409).json({ message: "Student ID or email already exists" });
    res.status(400).json({ message: "Failed to update student", error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(400).json({ message: "Invalid student ID" });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
