const Teacher = require("../models/teacherModel");

const clean = (doc) => ({ ...doc, id: doc._id });

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ _id: -1 }).lean();
    res.json(teachers.map(clean));
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Failed to fetch teachers", error: error.message });
  }
};

const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).lean();
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(clean(teacher));
  } catch (error) {
    res.status(400).json({ message: "Invalid teacher ID" });
  }
};

const createTeacher = async (req, res) => {
  const { teacher_id, first_name, last_name, email, phone, department, subject, qualification, joining_year } = req.body;
  if (!teacher_id || !first_name || !last_name) return res.status(400).json({ message: "Teacher ID, first name and last name are required" });
  try {
    const teacher = await Teacher.create({ teacher_id, first_name, last_name, email, phone, department, subject, qualification, joining_year });
    res.status(201).json({ message: "Teacher created successfully", id: teacher._id, teacher: clean(teacher.toObject()) });
  } catch (error) {
    console.error("Create teacher error:", error);
    if (error.code === 11000) return res.status(409).json({ message: "Teacher ID or email already exists" });
    res.status(500).json({ message: "Failed to create teacher", error: error.message });
  }
};

const updateTeacher = async (req, res) => {
  const { teacher_id, first_name, last_name } = req.body;
  if (!teacher_id || !first_name || !last_name) return res.status(400).json({ message: "Teacher ID, first name and last name are required" });
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher updated successfully", teacher: clean(teacher) });
  } catch (error) {
    console.error("Update teacher error:", error);
    if (error.code === 11000) return res.status(409).json({ message: "Teacher ID or email already exists" });
    res.status(400).json({ message: "Failed to update teacher", error: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid teacher ID" });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
