import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

const getLocalDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getAttendanceStorageKey = (date) => {
  return `campusos_attendance_${date}`;
};

function Attendance() {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------

  const [students, setStudents] = useState([]);

  const [attendance, setAttendance] = useState({});

  const [selectedDate, setSelectedDate] = useState(
    getLocalDate()
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------------------------------
  // LOCAL STORAGE ATTENDANCE
  // -------------------------------------------------

  const getLocalAttendance = useCallback((date) => {
    try {
      const saved = localStorage.getItem(
        getAttendanceStorageKey(date)
      );

      if (!saved) {
        return {};
      }

      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }

      return {};
    } catch (error) {
      console.error(
        "Local attendance read error:",
        error
      );

      return {};
    }
  }, []);

  const saveLocalAttendance = useCallback(
    (date, attendanceData) => {
      try {
        localStorage.setItem(
          getAttendanceStorageKey(date),
          JSON.stringify(attendanceData)
        );
      } catch (error) {
        console.error(
          "Local attendance save error:",
          error
        );
      }
    },
    []
  );

  // -------------------------------------------------
  // LOAD STUDENTS
  // -------------------------------------------------

  const loadStudents = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/students`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch students"
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid students response"
        );
      }

      setStudents(data);

    } catch (err) {
      console.error(
        "Student loading error:",
        err
      );

      setError(
        "Unable to load students."
      );
    }
  }, []);

  // -------------------------------------------------
  // LOAD ATTENDANCE
  // -------------------------------------------------

  const loadAttendance = useCallback(
    async (date) => {
      try {
        setError("");

        // -------------------------------------------------
        // FIRST LOAD LOCAL BACKUP
        // -------------------------------------------------

        const localAttendance =
          getLocalAttendance(date);

        if (
          Object.keys(localAttendance).length > 0
        ) {
          setAttendance(localAttendance);
        } else {
          setAttendance({});
        }

        // -------------------------------------------------
        // THEN LOAD FROM DATABASE
        // -------------------------------------------------

        const response = await fetch(
          `${API_URL}/attendance?date=${encodeURIComponent(
            date
          )}`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to fetch attendance"
          );
        }

        const result = await response.json();

        // Support both:
        // [...]
        // and { records: [...] }
        const data = Array.isArray(result)
          ? result
          : Array.isArray(result.records)
          ? result.records
          : [];

        const databaseAttendance = {};

        data.forEach((record) => {
          const studentId =
            record.student_id ??
            record.studentId ??
            record.student?.id;

          const status =
            record.status;

          if (
            studentId !== undefined &&
            studentId !== null &&
            status
          ) {
            databaseAttendance[
              String(studentId)
            ] = status;
          }
        });

        // -------------------------------------------------
        // DATABASE IS THE PRIMARY SOURCE.
        // LOCAL DATA IS USED AS BACKUP IF DATABASE
        // HAS NO RECORDS.
        // -------------------------------------------------

        if (
          Object.keys(databaseAttendance).length >
          0
        ) {
          setAttendance(
            databaseAttendance
          );

          saveLocalAttendance(
            date,
            databaseAttendance
          );
        } else if (
          Object.keys(localAttendance).length >
          0
        ) {
          setAttendance(
            localAttendance
          );
        } else {
          setAttendance({});
        }

      } catch (err) {
        console.error(
          "Attendance loading error:",
          err
        );

        // -------------------------------------------------
        // IF DATABASE IS TEMPORARILY UNAVAILABLE,
        // KEEP THE LOCAL SAVED ATTENDANCE.
        // -------------------------------------------------

        const localAttendance =
          getLocalAttendance(date);

        if (
          Object.keys(localAttendance).length >
          0
        ) {
          setAttendance(
            localAttendance
          );

          setError(
            "Database unavailable. Showing saved attendance from this browser."
          );
        } else {
          setAttendance({});

          setError(
            "Unable to load saved attendance."
          );
        }
      }
    },
    [
      getLocalAttendance,
      saveLocalAttendance,
    ]
  );

  // -------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      await loadStudents();

      setLoading(false);
    };

    initialize();
  }, [loadStudents]);

  // -------------------------------------------------
  // LOAD ATTENDANCE WHEN DATE CHANGES
  // -------------------------------------------------

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [
    selectedDate,
    loadAttendance,
  ]);

  // -------------------------------------------------
  // MARK ATTENDANCE
  // -------------------------------------------------

  const markAttendance = (
    studentId,
    status
  ) => {
    const id = String(studentId);

    setAttendance((previous) => {
      const updated = {
        ...previous,
        [id]: status,
      };

      // -------------------------------------------------
      // SAVE IMMEDIATELY TO LOCAL STORAGE
      // -------------------------------------------------

      saveLocalAttendance(
        selectedDate,
        updated
      );

      return updated;
    });

    setMessage("");
    setError("");
  };

  // -------------------------------------------------
  // SAVE ATTENDANCE
  // -------------------------------------------------

  const saveAttendance = async () => {
    if (students.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // -------------------------------------------------
      // CREATE RECORDS
      // -------------------------------------------------

      const records = students.map(
        (student) => ({
          student_id: student.id,
          date: selectedDate,

          // If no status was selected, leave it
          // as Absent rather than silently marking
          // everyone Present.
          status:
            attendance[String(student.id)] ||
            "Absent",
        })
      );

      // -------------------------------------------------
      // SAVE LOCAL BACKUP BEFORE REQUEST
      // -------------------------------------------------

      const finalAttendance = {};

      records.forEach((record) => {
        finalAttendance[
          String(record.student_id)
        ] = record.status;
      });

      saveLocalAttendance(
        selectedDate,
        finalAttendance
      );

      // Update UI with final saved values
      setAttendance(
        finalAttendance
      );

      // -------------------------------------------------
      // SAVE TO DATABASE
      // -------------------------------------------------

      const response = await fetch(
        `${API_URL}/attendance`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            date: selectedDate,
            records,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save attendance"
        );
      }

      // -------------------------------------------------
      // SAVE CONFIRMED DATABASE DATA LOCALLY
      // -------------------------------------------------

      saveLocalAttendance(
        selectedDate,
        finalAttendance
      );

      setMessage(
        "Attendance saved successfully."
      );

      // -------------------------------------------------
      // RELOAD FROM DATABASE
      // -------------------------------------------------

      await loadAttendance(
        selectedDate
      );

    } catch (err) {
      console.error(
        "Save attendance error:",
        err
      );

      // Local copy remains available even if
      // the server request failed.

      setError(
        `${err.message}. A local backup has been kept in this browser.`
      );

    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------
  // FILTER STUDENTS
  // -------------------------------------------------

  const filteredStudents = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter(
      (student) => {
        const studentId = String(
          student.student_id || ""
        ).toLowerCase();

        const firstName = String(
          student.first_name || ""
        ).toLowerCase();

        const lastName = String(
          student.last_name || ""
        ).toLowerCase();

        const department = String(
          student.department || ""
        ).toLowerCase();

        return (
          studentId.includes(search) ||
          firstName.includes(search) ||
          lastName.includes(search) ||
          department.includes(search)
        );
      }
    );
  }, [
    students,
    searchTerm,
  ]);

  // -------------------------------------------------
  // STATISTICS
  // -------------------------------------------------

  const presentCount =
    students.filter(
      (student) =>
        attendance[
          String(student.id)
        ] === "Present"
    ).length;

  const absentCount =
    students.filter(
      (student) =>
        attendance[
          String(student.id)
        ] === "Absent"
    ).length;

  const lateCount =
    students.filter(
      (student) =>
        attendance[
          String(student.id)
        ] === "Late"
    ).length;

  const markedCount =
    presentCount +
    absentCount +
    lateCount;

  const attendancePercentage =
    students.length > 0
      ? Math.round(
          (presentCount /
            students.length) *
            100
        )
      : 0;

  // -------------------------------------------------
  // STUDENT INITIALS
  // -------------------------------------------------

  const getInitials = (student) => {
    const first =
      student.first_name?.[0] || "";

    const last =
      student.last_name?.[0] || "";

    return `${first}${last}`.toUpperCase() || "S";
  };

  // -------------------------------------------------
  // PAGE
  // -------------------------------------------------

  return (
    <div className="attendance-page">

      {/* HEADER */}

      <header className="attendance-header">

        <div>

          <p className="attendance-label">
            ADMIN PORTAL
          </p>

          <h1>
            Attendance
          </h1>

          <p className="attendance-subtitle">
            Manage daily student attendance.
          </p>

        </div>

        <div className="attendance-date-box">

          <label>
            Attendance Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
          />

        </div>

      </header>

      {/* MESSAGES */}

      {message && (
        <div className="attendance-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="attendance-message error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <section className="attendance-stats">

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon blue">
            👨‍🎓
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

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon green">
            ✓
          </div>

          <div>
            <span>
              Present
            </span>

            <strong>
              {presentCount}
            </strong>
          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon red">
            ✕
          </div>

          <div>
            <span>
              Absent
            </span>

            <strong>
              {absentCount}
            </strong>
          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon orange">
            ◷
          </div>

          <div>
            <span>
              Late
            </span>

            <strong>
              {lateCount}
            </strong>
          </div>

        </div>

        <div className="attendance-stat-card">

          <div className="attendance-stat-icon purple">
            %
          </div>

          <div>
            <span>
              Attendance
            </span>

            <strong>
              {attendancePercentage}%
            </strong>
          </div>

        </div>

      </section>

      {/* MAIN AREA */}

      <section className="attendance-layout">

        {/* ATTENDANCE FORM */}

        <div className="attendance-card">

          <div className="card-heading">

            <h2>
              Mark Attendance
            </h2>

            <p>
              Select Present, Absent or Late
              for each student.
            </p>

          </div>

          {loading ? (
            <div className="attendance-loading">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div>
                <span>
                  👨‍🎓
                </span>

                <strong>
                  No students found
                </strong>

                <p>
                  Add students before marking attendance.
                </p>
              </div>
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

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
                      Attendance
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {students.map(
                    (student, index) => {
                      const studentKey =
                        String(student.id);

                      const currentStatus =
                        attendance[
                          studentKey
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
                                {getInitials(
                                  student
                                )}
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

                                <small>
                                  Student
                                </small>

                              </div>

                            </div>

                          </td>

                          <td>
                            {
                              student.student_id ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              student.department ||
                              "-"
                            }
                          </td>

                          <td>

                            <div className="attendance-buttons">

                              <button
                                type="button"
                                className={
                                  currentStatus ===
                                  "Present"
                                    ? "attendance-mark present active"
                                    : "attendance-mark present"
                                }
                                onClick={() =>
                                  markAttendance(
                                    student.id,
                                    "Present"
                                  )
                                }
                              >
                                Present
                              </button>

                              <button
                                type="button"
                                className={
                                  currentStatus ===
                                  "Absent"
                                    ? "attendance-mark absent active"
                                    : "attendance-mark absent"
                                }
                                onClick={() =>
                                  markAttendance(
                                    student.id,
                                    "Absent"
                                  )
                                }
                              >
                                Absent
                              </button>

                              <button
                                type="button"
                                className={
                                  currentStatus ===
                                  "Late"
                                    ? "attendance-mark late active"
                                    : "attendance-mark late"
                                }
                                onClick={() =>
                                  markAttendance(
                                    student.id,
                                    "Late"
                                  )
                                }
                              >
                                Late
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* SAVE */}

          {!loading &&
            students.length > 0 && (
              <div className="form-actions">

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    saveAttendance
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Attendance"}
                </button>

              </div>
            )}

        </div>

        {/* SUMMARY */}

        <div className="attendance-card summary-card">

          <div className="card-heading">

            <h2>
              Daily Summary
            </h2>

            <p>
              Attendance for {selectedDate}
            </p>

          </div>

          <div
            className="summary-circle"
            style={{
              "--percentage":
                attendancePercentage,
            }}
          >

            <div>

              <strong>
                {attendancePercentage}%
              </strong>

              <span>
                Present
              </span>

            </div>

          </div>

          <div className="summary-items">

            <div>

              <span className="summary-dot present"></span>

              <span>
                Present
              </span>

              <strong>
                {presentCount}
              </strong>

            </div>

            <div>

              <span className="summary-dot absent"></span>

              <span>
                Absent
              </span>

              <strong>
                {absentCount}
              </strong>

            </div>

            <div>

              <span className="summary-dot late"></span>

              <span>
                Late
              </span>

              <strong>
                {lateCount}
              </strong>

            </div>

            <div>

              <span
                className="summary-dot"
                style={{
                  background:
                    "#94a3b8",
                }}
              ></span>

              <span>
                Marked
              </span>

              <strong>
                {markedCount}
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* RECORDS */}

      <section className="attendance-card records-card">

        <div className="records-header">

          <div>

            <h2>
              Attendance Records
            </h2>

            <p>
              Review and update attendance
              for {selectedDate}.
            </p>

          </div>

          <div className="records-tools">

            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              className="refresh-button"
              onClick={() =>
                loadAttendance(
                  selectedDate
                )
              }
            >
              ↻ Refresh
            </button>

          </div>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

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
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.length ===
              0 ? (
                <tr>

                  <td
                    colSpan="5"
                    className="empty-state"
                  >

                    <div>

                      <span>
                        🔍
                      </span>

                      <strong>
                        No students found
                      </strong>

                      <p>
                        Try a different search.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                filteredStudents.map(
                  (student) => {
                    const studentKey =
                      String(student.id);

                    const status =
                      attendance[
                        studentKey
                      ];

                    return (
                      <tr
                        key={
                          student.id
                        }
                      >

                        <td>

                          <div className="student-cell">

                            <div className="student-avatar">
                              {getInitials(
                                student
                              )}
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

                              <small>
                                Student
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          {
                            student.student_id ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            student.department ||
                            "-"
                          }
                        </td>

                        <td>

                          {status ? (
                            <span
                              className={`status-badge ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>
                          ) : (
                            <span
                              className="status-badge"
                              style={{
                                background:
                                  "#f1f5f9",
                                color:
                                  "#64748b",
                              }}
                            >
                              Not marked
                            </span>
                          )}

                        </td>

                        <td>

                          <div className="table-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                markAttendance(
                                  student.id,
                                  "Present"
                                )
                              }
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                markAttendance(
                                  student.id,
                                  "Absent"
                                )
                              }
                            >
                              Absent
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Attendance;