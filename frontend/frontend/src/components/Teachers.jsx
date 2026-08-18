import { useEffect, useState } from "react";
import "./Teachers.css";

const API_URL = "http://localhost:5000";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    teacher_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    qualification: "",
    joining_year: "",
  });

  // =========================
  // LOAD TEACHERS
  // =========================

  const loadTeachers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/teachers`);

      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const data = await response.json();

      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load teachers error:", error);
      alert("Unable to load teachers. Make sure the backend is running.");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      teacher_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      subject: "",
      qualification: "",
      joining_year: "",
    });

    setEditingTeacher(null);
  };

  // =========================
  // ADD TEACHER
  // =========================

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // =========================
  // EDIT TEACHER
  // =========================

  const openEditForm = (teacher) => {
    setEditingTeacher(teacher);

    setForm({
      teacher_id: teacher.teacher_id || "",
      first_name: teacher.first_name || "",
      last_name: teacher.last_name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      department: teacher.department || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      joining_year: teacher.joining_year || "",
    });

    setShowForm(true);
  };

  // =========================
  // SAVE TEACHER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.teacher_id || !form.first_name || !form.last_name) {
      alert("Teacher ID, first name and last name are required.");
      return;
    }

    try {
      const url = editingTeacher
        ? `${API_URL}/teachers/${editingTeacher.id}`
        : `${API_URL}/teachers`;

      const method = editingTeacher ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_id: form.teacher_id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email || null,
          phone: form.phone || null,
          department: form.department || null,
          subject: form.subject || null,
          qualification: form.qualification || null,
          joining_year: form.joining_year
            ? Number(form.joining_year)
            : null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save teacher"
        );
      }

      alert(
        editingTeacher
          ? "Teacher updated successfully."
          : "Teacher added successfully."
      );

      setShowForm(false);
      resetForm();

      await loadTeachers();
    } catch (error) {
      console.error("Save teacher error:", error);
      alert(error.message);
    }
  };

  // =========================
  // DELETE TEACHER
  // =========================

  const deleteTeacher = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teachers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete teacher"
        );
      }

      alert("Teacher deleted successfully.");

      await loadTeachers();
    } catch (error) {
      console.error("Delete teacher error:", error);
      alert(error.message);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredTeachers = teachers.filter((teacher) => {
    const searchText = search.toLowerCase();

    const fullName =
      `${teacher.first_name || ""} ${
        teacher.last_name || ""
      }`.toLowerCase();

    return (
      fullName.includes(searchText) ||
      String(teacher.teacher_id || "")
        .toLowerCase()
        .includes(searchText) ||
      String(teacher.email || "")
        .toLowerCase()
        .includes(searchText) ||
      String(teacher.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      String(teacher.department || "")
        .toLowerCase()
        .includes(searchText) ||
      String(teacher.subject || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div className="teachers-page">

      {/* ================= HEADER ================= */}

      <div className="teachers-header">
        <div>
          <p className="page-label">
            ADMIN PORTAL
          </p>

          <h1>Teachers</h1>

          <p>
            Manage faculty records and teaching assignments.
          </p>
        </div>

        <button
          className="add-teacher-btn"
          onClick={openAddForm}
        >
          + Add Teacher
        </button>
      </div>


      {/* ================= TOOLBAR ================= */}

      <div className="teachers-toolbar">

        <input
          type="text"
          placeholder="Search by name, ID, department or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>
          {filteredTeachers.length} teacher
          {filteredTeachers.length !== 1 ? "s" : ""}
        </span>

      </div>


      {/* ================= TABLE ================= */}

      <div className="teachers-table-card">

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading teachers...</h3>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              👨‍🏫
            </div>

            <h3>
              {search
                ? "No matching teachers"
                : "No teachers found"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first teacher to the system."}
            </p>

            {!search && (
              <button
                className="add-teacher-btn"
                onClick={openAddForm}
              >
                + Add Teacher
              </button>
            )}

          </div>
        ) : (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Teacher ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Qualification</th>
                  <th>Joining Year</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredTeachers.map((teacher) => {

                  const fullName =
                    `${teacher.first_name || ""} ${
                      teacher.last_name || ""
                    }`.trim();

                  return (
                    <tr key={teacher.id}>

                      <td>
                        <div className="teacher-name">

                          <div className="teacher-avatar">
                            {(teacher.first_name || "T")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {fullName || "Unnamed"}
                          </strong>

                        </div>
                      </td>

                      <td>
                        {teacher.teacher_id || "-"}
                      </td>

                      <td>
                        {teacher.email || "-"}
                      </td>

                      <td>
                        {teacher.phone || "-"}
                      </td>

                      <td>
                        {teacher.department || "-"}
                      </td>

                      <td>
                        {teacher.subject || "-"}
                      </td>

                      <td>
                        {teacher.qualification || "-"}
                      </td>

                      <td>
                        {teacher.joining_year || "-"}
                      </td>

                      <td>

                        <div className="teacher-actions">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              openEditForm(teacher)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteTeacher(teacher.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* ================= MODAL ================= */}

      {showForm && (

        <div className="modal-overlay">

          <div className="teacher-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingTeacher
                    ? "Edit Teacher"
                    : "Add Teacher"}
                </h2>

                <p>
                  Enter the teacher's information below.
                </p>
              </div>

              <button
                type="button"
                className="close-modal"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* TEACHER ID */}

                <div className="form-group">

                  <label>
                    Teacher ID *
                  </label>

                  <input
                    name="teacher_id"
                    value={form.teacher_id}
                    onChange={handleChange}
                    required
                    placeholder="TCH001"
                  />

                </div>


                {/* FIRST NAME */}

                <div className="form-group">

                  <label>
                    First Name *
                  </label>

                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                  />

                </div>


                {/* LAST NAME */}

                <div className="form-group">

                  <label>
                    Last Name *
                  </label>

                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                  />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="teacher@campus.edu"
                  />

                </div>


                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />

                </div>


                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Computer Science"
                  />

                </div>


                {/* SUBJECT */}

                <div className="form-group">

                  <label>
                    Subject
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Data Structures"
                  />

                </div>


                {/* QUALIFICATION */}

                <div className="form-group">

                  <label>
                    Qualification
                  </label>

                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="M.Tech / PhD"
                  />

                </div>


                {/* JOINING YEAR */}

                <div className="form-group">

                  <label>
                    Joining Year
                  </label>

                  <input
                    type="number"
                    name="joining_year"
                    value={form.joining_year}
                    onChange={handleChange}
                    min="1950"
                    max="2100"
                    placeholder="2026"
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingTeacher
                    ? "Update Teacher"
                    : "Add Teacher"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Teachers;