import { useEffect, useState } from "react";
import "./Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    semester: "",
    admission_year: ""
  });

  // =========================
  // GET STUDENTS
  // =========================

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/students");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load students. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const fullName =
      `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();

    return (
      String(student.student_id || "")
        .toLowerCase()
        .includes(search) ||
      fullName.includes(search) ||
      String(student.email || "")
        .toLowerCase()
        .includes(search) ||
      String(student.department || "")
        .toLowerCase()
        .includes(search) ||
      String(student.course || "")
        .toLowerCase()
        .includes(search) ||
      String(student.phone || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      student_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      course: "",
      semester: "",
      admission_year: ""
    });

    setEditingStudent(null);
  };

  // =========================
  // ADD STUDENT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const response = await fetch("http://localhost:5000/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          semester: formData.semester
            ? Number(formData.semester)
            : null,
          admission_year: formData.admission_year
            ? Number(formData.admission_year)
            : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create student"
        );
      }

      resetForm();
      setShowForm(false);

      await fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      student_id: student.student_id || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department || "",
      course: student.course || "",
      semester: student.semester || "",
      admission_year: student.admission_year || ""
    });

    setShowForm(true);
  };

  // =========================
  // UPDATE STUDENT
  // =========================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingStudent) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/students/${editingStudent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            semester: formData.semester
              ? Number(formData.semester)
              : null,
            admission_year: formData.admission_year
              ? Number(formData.admission_year)
              : null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update student"
        );
      }

      resetForm();
      setShowForm(false);

      await fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDelete = async (student) => {
    const fullName =
      `${student.first_name || ""} ${student.last_name || ""}`.trim();

    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullName || "this student"}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/students/${student.id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete student"
        );
      }

      await fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
    setError("");
  };

  return (
    <div className="students-page">

      {/* HEADER */}

      <div className="students-header">

        <div>
          <p className="students-label">
            STUDENT MANAGEMENT
          </p>

          <h1>Students</h1>

          <span>
            Manage student records and academic information.
          </span>
        </div>

        <button
          className="add-student-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Student
        </button>

      </div>


      {/* SUMMARY */}

      <div className="student-summary">

        <div className="summary-card">

          <span className="summary-icon">
            👨‍🎓
          </span>

          <div>
            <p>Total Students</p>
            <strong>{students.length}</strong>
          </div>

        </div>


        <div className="summary-card">

          <span className="summary-icon">
            🎓
          </span>

          <div>
            <p>Departments</p>

            <strong>
              {
                new Set(
                  students
                    .map((student) => student.department)
                    .filter(Boolean)
                ).size
              }
            </strong>

          </div>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="students-error">
          {error}
        </div>
      )}


      {/* STUDENTS PANEL */}

      <div className="students-panel">

        <div className="students-panel-header">

          <div>
            <h2>All Students</h2>

            <p>
              Showing {filteredStudents.length} of{" "}
              {students.length} student
              {students.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchStudents}
          >
            ↻ Refresh
          </button>

        </div>


        {/* SEARCH */}

        <div className="students-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by name, ID, email, department or course..."
          />

          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}

        </div>


        {loading ? (

          <div className="students-empty">

            <div className="loading-spinner"></div>

            <p>Loading students...</p>

          </div>

        ) : filteredStudents.length === 0 ? (

          <div className="students-empty">

            <div className="empty-icon">
              {searchTerm ? "🔍" : "👨‍🎓"}
            </div>

            <h3>
              {searchTerm
                ? "No students found"
                : "No students yet"}
            </h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Add your first student to CampusOS."}
            </p>

            {!searchTerm && (
              <button
                className="empty-add-button"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                + Add Student
              </button>
            )}

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Student ID</th>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {filteredStudents.map((student) => (

                  <tr key={student.id}>

                    <td>
                      <span className="student-id">
                        {student.student_id}
                      </span>
                    </td>


                    <td>

                      <div className="student-name">

                        <div className="student-avatar">
                          {student.first_name?.charAt(0)}
                          {student.last_name?.charAt(0)}
                        </div>

                        <div>

                          <strong>
                            {student.first_name}{" "}
                            {student.last_name}
                          </strong>

                          <small>
                            {student.email || "No email"}
                          </small>

                        </div>

                      </div>

                    </td>


                    <td>
                      {student.department || "—"}
                    </td>


                    <td>
                      {student.course || "—"}
                    </td>


                    <td>
                      {student.semester
                        ? `Semester ${student.semester}`
                        : "—"}
                    </td>


                    <td>
                      {student.phone || "—"}
                    </td>


                    <td>

                      <div className="student-actions">

                        <button
                          className="edit-student-button"
                          onClick={() => handleEdit(student)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-student-button"
                          onClick={() => handleDelete(student)}
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={handleCloseForm}
        >

          <div
            className="student-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <p>STUDENT RECORD</p>

                <h2>
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

              </div>


              <button
                className="close-button"
                onClick={handleCloseForm}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                editingStudent
                  ? handleUpdate
                  : handleSubmit
              }
            >

              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Student ID *
                  </label>

                  <input
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="STU002"
                    required
                  />

                </div>


                <div className="form-field">

                  <label>
                    First Name *
                  </label>

                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />

                </div>


                <div className="form-field">

                  <label>
                    Last Name *
                  </label>

                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />

                </div>


                <div className="form-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Department
                  </label>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Engineering"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Course
                  </label>

                  <input
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="B.Tech"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Semester
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="12"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="4"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Admission Year
                  </label>

                  <input
                    type="number"
                    name="admission_year"
                    value={formData.admission_year}
                    onChange={handleChange}
                    placeholder="2026"
                  />

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-button"
                >
                  {editingStudent
                    ? "Update Student"
                    : "Save Student"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Students;