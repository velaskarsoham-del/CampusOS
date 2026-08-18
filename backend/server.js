const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./config/mongodb");

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to CampusOS Backend 🚀", database: "MongoDB" });
});

const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => console.log(`🚀 CampusOS Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
