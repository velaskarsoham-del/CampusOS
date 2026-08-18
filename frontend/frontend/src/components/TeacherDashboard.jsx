import { useEffect, useMemo, useState } from "react";
import "./TeacherDashboard.css";

const API_URL = "http://localhost:5000";

function TeacherDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [teacherProfile, setTeacherProfile] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

  const [savingAttendance, setSavingAttendance] =
    useState(false);

  const [message, setMessage] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {
    setLoadingStudents(true);

    try {
      const response = await fetch(`${API_URL}/students`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Student fetch error:", error);

      setMessage(
        "Unable to load students. Please make sure the backend is running."
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  // =====================================================
  // FETCH TEACHER PROFILE
  // =====================================================

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/teachers`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return;
      }

      const loggedInEmail =
        (user?.email || "").trim().toLowerCase();

      const profile = data.find(
        (teacher) =>
          teacher.email &&
          teacher.email.trim().toLowerCase() ===
            loggedInEmail
      );

      if (profile) {
        setTeacherProfile(profile);
      }
    } catch (error) {
      console.error(
        "Teacher profile fetch error:",
        error
      );
    }
  };

  // =====================================================
  // FETCH ATTENDANCE
  // =====================================================

  const fetchAttendance = async () => {
    setLoadingAttendance(true);

    try {
      const response = await fetch(
        `${API_URL}/attendance?date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch attendance"
        );
      }

      const data = await response.json();

      const attendanceMap = {};

      if (Array.isArray(data)) {
        data.forEach((record) => {
          attendanceMap[record.student_id] =
            record.status;
        });
      }

      setAttendance(attendanceMap);
    } catch (error) {
      console.error(
        "Attendance fetch error:",
        error
      );

      setMessage(
        "Unable to load attendance for this date."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  // =====================================================
  // FETCH ATTENDANCE STATISTICS
  // =====================================================

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance/stats?date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch attendance statistics"
        );
      }

      const data = await response.json();

      setStats({
        total: Number(data?.total || 0),
        present: Number(data?.present || 0),
        absent: Number(data?.absent || 0),
      });
    } catch (error) {
      console.error(
        "Attendance statistics error:",
        error
      );

      setStats({
        total: 0,
        present: 0,
        absent: 0,
      });
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchStudents();
    fetchTeacherProfile();
  }, []);

  // =====================================================
  // LOAD ATTENDANCE WHEN DATE CHANGES
  // =====================================================

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, [selectedDate]);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      const fullName =
        `${student.first_name || ""} ${
          student.last_name || ""
        }`.toLowerCase();

      const studentId =
        String(student.student_id || "").toLowerCase();

      const email =
        String(student.email || "").toLowerCase();

      const department =
        String(
          student.department || ""
        ).toLowerCase();

      const course =
        String(student.course || "").toLowerCase();

      return (
        fullName.includes(search) ||
        studentId.includes(search) ||
        email.includes(search) ||
        department.includes(search) ||
        course.includes(search)
      );
    });
  }, [students, searchTerm]);

  // =====================================================
  // ATTENDANCE COUNTS
  // =====================================================

  const currentPresentCount = students.filter(
    (student) =>
      attendance[student.id] === "Present"
  ).length;

  const currentAbsentCount = students.filter(
    (student) =>
      attendance[student.id] === "Absent"
  ).length;

  const unmarkedCount =
    students.length -
    currentPresentCount -
    currentAbsentCount;

  // =====================================================
  // SET ATTENDANCE FOR ONE STUDENT
  // =====================================================

  const setStudentStatus = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  };

  // =====================================================
  // MARK ALL PRESENT
  // =====================================================

  const markAllPresent = () => {
    const updated = {};

    students.forEach((student) => {
      updated[student.id] = "Present";
    });

    setAttendance(updated);
  };

  // =====================================================
  // MARK ALL ABSENT
  // =====================================================

  const markAllAbsent = () => {
    const updated = {};

    students.forEach((student) => {
      updated[student.id] = "Absent";
    });

    setAttendance(updated);
  };

  // =====================================================
  // SAVE ATTENDANCE
  // =====================================================

  const saveAttendance = async () => {
    if (students.length === 0) {
      setMessage("There are no students to mark.");
      return;
    }

    const records = students.map((student) => ({
      student_id: student.id,
      status:
        attendance[student.id] || "Absent",
    }));

    setSavingAttendance(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            records,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save attendance"
        );
      }

      setMessage(
        "Attendance saved successfully."
      );

      await fetchAttendance();
      await fetchStats();
    } catch (error) {
      console.error(
        "Save attendance error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to save attendance."
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  // =====================================================
  // DATE DISPLAY
  // =====================================================

  const formattedDate = new Date(
    `${selectedDate}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =====================================================
  // TEACHER DISPLAY NAME
  // =====================================================

  const teacherName =
    teacherProfile
      ? `${teacherProfile.first_name || ""} ${
          teacherProfile.last_name || ""
        }`.trim()
      : user?.name || "Teacher";

  const teacherDepartment =
    teacherProfile?.department || "Faculty";

  const teacherSubject =
    teacherProfile?.subject || "Campus Faculty";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="teacher-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="teacher-sidebar">

        <div className="teacher-brand">

          <div className="teacher-brand-icon">
            C
          </div>

          <div>
            <strong>
              CampusOS
            </strong>

            <span>
              Faculty Portal
            </span>
          </div>

        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <button
          className={`sidebar-item ${
            activePage === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("dashboard")
          }
        >
          <span className="sidebar-icon">
            ▦
          </span>

          Dashboard
        </button>

        <button
          className={`sidebar-item ${
            activePage === "attendance"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("attendance")
          }
        >
          <span className="sidebar-icon">
            ✓
          </span>

          Attendance
        </button>

        <button
          className={`sidebar-item ${
            activePage === "students"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("students")
          }
        >
          <span className="sidebar-icon">
            ◉
          </span>

          Students
        </button>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {teacherName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {teacherName}
            </strong>

            <span>
              {teacherDepartment}
            </span>
          </div>

        </div>

        <button
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span>
            ↪
          </span>

          Logout
        </button>

      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <main className="teacher-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="teacher-topbar">

          <div>
            <p className="topbar-label">
              FACULTY PORTAL
            </p>

            <h1>
              {activePage === "attendance"
                ? "Attendance"
                : activePage === "students"
                ? "Students"
                : "Teacher Dashboard"}
            </h1>
          </div>

          <div className="topbar-profile">

            <div className="topbar-avatar">
              {teacherName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {teacherName}
              </strong>

              <span>
                {teacherSubject}
              </span>
            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="teacher-content">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "dashboard" && (
            <>
              <div className="welcome-card">

                <div>
                  <p>
                    GOOD TO SEE YOU
                  </p>

                  <h2>
                    Welcome, {teacherName}
                  </h2>

                  <span>
                    Manage your students and
                    attendance from your faculty
                    dashboard.
                  </span>
                </div>

                <div className="welcome-icon">
                  🎓
                </div>

              </div>

              <div className="teacher-stat-grid">

                <div className="teacher-stat-card">

                  <div className="stat-card-icon blue">
                    ◉
                  </div>

                  <div>
                    <span>
                      Total Students
                    </span>

                    <strong>
                      {students.length}
                    </strong>
                  </div>

                </div>

                <div className="teacher-stat-card">

                  <div className="stat-card-icon green">
                    ✓
                  </div>

                  <div>
                    <span>
                      Present Today
                    </span>

                    <strong>
                      {currentPresentCount}
                    </strong>
                  </div>

                </div>

                <div className="teacher-stat-card">

                  <div className="stat-card-icon red">
                    !
                  </div>

                  <div>
                    <span>
                      Absent Today
                    </span>

                    <strong>
                      {currentAbsentCount}
                    </strong>
                  </div>

                </div>

                <div className="teacher-stat-card">

                  <div className="stat-card-icon orange">
                    ◷
                  </div>

                  <div>
                    <span>
                      Not Marked
                    </span>

                    <strong>
                      {unmarkedCount}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="dashboard-grid">

                <div className="dashboard-panel">

                  <div className="panel-heading">

                    <div>
                      <h3>
                        Today's Attendance
                      </h3>

                      <span>
                        {formattedDate}
                      </span>
                    </div>

                    <button
                      className="primary-small-button"
                      onClick={() =>
                        setActivePage(
                          "attendance"
                        )
                      }
                    >
                      Mark Attendance →
                    </button>

                  </div>

                  <div className="attendance-summary">

                    <div className="summary-item">
                      <span className="summary-dot green" />
                      <span>
                        Present
                      </span>
                      <strong>
                        {currentPresentCount}
                      </strong>
                    </div>

                    <div className="summary-item">
                      <span className="summary-dot red" />
                      <span>
                        Absent
                      </span>
                      <strong>
                        {currentAbsentCount}
                      </strong>
                    </div>

                    <div className="summary-item">
                      <span className="summary-dot gray" />
                      <span>
                        Not Marked
                      </span>
                      <strong>
                        {unmarkedCount}
                      </strong>
                    </div>

                  </div>

                </div>

                <div className="dashboard-panel teacher-info-panel">

                  <div className="panel-heading">
                    <div>
                      <h3>
                        My Profile
                      </h3>

                      <span>
                        Faculty information
                      </span>
                    </div>
                  </div>

                  <div className="profile-details">

                    <div>
                      <span>
                        Name
                      </span>

                      <strong>
                        {teacherName}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {user?.email || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Department
                      </span>

                      <strong>
                        {teacherDepartment}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Subject
                      </span>

                      <strong>
                        {teacherSubject}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>
            </>
          )}

          {/* =================================================
              ATTENDANCE PAGE
          ================================================= */}

          {activePage === "attendance" && (
            <>

              <div className="page-toolbar">

                <div>
                  <h2>
                    Mark Attendance
                  </h2>

                  <p>
                    Record attendance for your students.
                  </p>
                </div>

                <div className="date-control">

                  <label>
                    Attendance Date
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="attendance-stat-grid">

                <div className="mini-stat">
                  <span>
                    Total Students
                  </span>

                  <strong>
                    {students.length}
                  </strong>
                </div>

                <div className="mini-stat present-mini">
                  <span>
                    Present
                  </span>

                  <strong>
                    {currentPresentCount}
                  </strong>
                </div>

                <div className="mini-stat absent-mini">
                  <span>
                    Absent
                  </span>

                  <strong>
                    {currentAbsentCount}
                  </strong>
                </div>

                <div className="mini-stat pending-mini">
                  <span>
                    Not Marked
                  </span>

                  <strong>
                    {unmarkedCount}
                  </strong>
                </div>

              </div>

              <div className="attendance-panel">

                <div className="attendance-panel-header">

                  <div>
                    <h3>
                      Student Attendance
                    </h3>

                    <span>
                      {formattedDate}
                    </span>
                  </div>

                  <div className="attendance-actions">

                    <button
                      className="secondary-button"
                      onClick={markAllPresent}
                      disabled={
                        loadingAttendance ||
                        students.length === 0
                      }
                    >
                      Mark All Present
                    </button>

                    <button
                      className="secondary-button danger-outline"
                      onClick={markAllAbsent}
                      disabled={
                        loadingAttendance ||
                        students.length === 0
                      }
                    >
                      Mark All Absent
                    </button>

                    <button
                      className="save-attendance-button"
                      onClick={saveAttendance}
                      disabled={
                        savingAttendance ||
                        loadingAttendance ||
                        students.length === 0
                      }
                    >
                      {savingAttendance
                        ? "Saving..."
                        : "Save Attendance"}
                    </button>

                  </div>

                </div>

                <div className="attendance-table-wrapper">

                  {loadingStudents ||
                  loadingAttendance ? (
                    <div className="table-loading">
                      <div className="loading-spinner" />
                      Loading attendance...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="empty-state">
                      <div>
                        ◉
                      </div>

                      <h3>
                        No students found
                      </h3>

                      <p>
                        Add students from the
                        Admin Dashboard first.
                      </p>
                    </div>
                  ) : (
                    <table className="attendance-table">

                      <thead>
                        <tr>
                          <th>
                            #
                          </th>

                          <th>
                            Student
                          </th>

                          <th>
                            Student ID
                          </th>

                          <th>
                            Department
                          </th>

                          <th>
                            Course
                          </th>

                          <th>
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {students.map(
                          (student, index) => {
                            const status =
                              attendance[
                                student.id
                              ];

                            return (
                              <tr
                                key={
                                  student.id
                                }
                              >

                                <td>
                                  {index + 1}
                                </td>

                                <td>
                                  <div className="student-cell">

                                    <div className="student-avatar">
                                      {(
                                        student.first_name ||
                                        "S"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div>
                                      <strong>
                                        {
                                          student.first_name
                                        }{" "}
                                        {
                                          student.last_name
                                        }
                                      </strong>

                                      <span>
                                        {
                                          student.email ||
                                          "No email"
                                        }
                                      </span>
                                    </div>

                                  </div>
                                </td>

                                <td>
                                  <span className="student-id">
                                    {
                                      student.student_id
                                    }
                                  </span>
                                </td>

                                <td>
                                  {
                                    student.department ||
                                    "—"
                                  }
                                </td>

                                <td>
                                  {
                                    student.course ||
                                    "—"
                                  }
                                </td>

                                <td>

                                  <div className="status-buttons">

                                    <button
                                      className={`status-button present ${
                                        status ===
                                        "Present"
                                          ? "selected"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setStudentStatus(
                                          student.id,
                                          "Present"
                                        )
                                      }
                                    >
                                      ✓ Present
                                    </button>

                                    <button
                                      className={`status-button absent ${
                                        status ===
                                        "Absent"
                                          ? "selected"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setStudentStatus(
                                          student.id,
                                          "Absent"
                                        )
                                      }
                                    >
                                      × Absent
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>
                  )}

                </div>

              </div>

              {message && (
                <div
                  className={`teacher-message ${
                    message.includes(
                      "successfully"
                    )
                      ? "success"
                      : "error"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="attendance-note">
                <span>
                  ℹ
                </span>

                <p>
                  Attendance is saved for the
                  selected date. Saving again on
                  the same date updates the
                  existing attendance records.
                </p>
              </div>

            </>
          )}

          {/* =================================================
              STUDENTS PAGE
          ================================================= */}

          {activePage === "students" && (
            <>

              <div className="page-toolbar">

                <div>
                  <h2>
                    My Students
                  </h2>

                  <p>
                    View the students available
                    in CampusOS.
                  </p>
                </div>

                <div className="student-search">

                  <span>
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="student-list-panel">

                <div className="student-list-header">

                  <div>
                    <strong>
                      {filteredStudents.length}
                    </strong>

                    <span>
                      students found
                    </span>
                  </div>

                  <button
                    className="refresh-button"
                    onClick={fetchStudents}
                  >
                    ↻ Refresh
                  </button>

                </div>

                {loadingStudents ? (
                  <div className="table-loading">
                    <div className="loading-spinner" />
                    Loading students...
                  </div>
                ) : filteredStudents.length ===
                  0 ? (
                  <div className="empty-state">
                    <div>
                      ◉
                    </div>

                    <h3>
                      No students found
                    </h3>

                    <p>
                      Try another search term.
                    </p>
                  </div>
                ) : (
                  <div className="student-cards-grid">

                    {filteredStudents.map(
                      (student) => (
                        <div
                          className="student-card"
                          key={student.id}
                        >

                          <div className="student-card-top">

                            <div className="large-student-avatar">
                              {(
                                student.first_name ||
                                "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <h3>
                                {
                                  student.first_name
                                }{" "}
                                {
                                  student.last_name
                                }
                              </h3>

                              <span>
                                {
                                  student.student_id
                                }
                              </span>
                            </div>

                          </div>

                          <div className="student-card-details">

                            <div>
                              <span>
                                Email
                              </span>

                              <strong>
                                {
                                  student.email ||
                                  "—"
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Department
                              </span>

                              <strong>
                                {
                                  student.department ||
                                  "—"
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Course
                              </span>

                              <strong>
                                {
                                  student.course ||
                                  "—"
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Semester
                              </span>

                              <strong>
                                {
                                  student.semester ||
                                  "—"
                                }
                              </strong>
                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </>
          )}

        </div>

      </main>

    </div>
  );
}

export default TeacherDashboard;