import "./StudentDashboard.css";

function StudentDashboard({ user, onLogout }) {
  const studentName = user?.name || "Student";

  const firstName = studentName.split(" ")[0];

  const initials = studentName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="student-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="student-sidebar">

        <div className="student-sidebar-brand">
          <div className="student-sidebar-logo">
            C
          </div>

          <span>CampusOS</span>
        </div>

        {/* MAIN MENU */}

        <div className="student-menu-section">

          <p>MAIN MENU</p>

          <button className="student-menu-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button className="student-menu-item">
            <span>📚</span>
            My Subjects
          </button>

          <button className="student-menu-item">
            <span>📅</span>
            Timetable
          </button>

          <button className="student-menu-item">
            <span>✓</span>
            Attendance
          </button>

          <button className="student-menu-item">
            <span>📝</span>
            Assignments
          </button>

          <button className="student-menu-item">
            <span>📋</span>
            Exams
          </button>

        </div>

        {/* CAMPUS */}

        <div className="student-menu-section">

          <p>CAMPUS</p>

          <button className="student-menu-item">
            <span>📢</span>
            Announcements
          </button>

          <button className="student-menu-item">
            <span>📖</span>
            Library
          </button>

          <button className="student-menu-item">
            <span>🪙</span>
            Campus Credits
          </button>

          <button className="student-menu-item">
            <span>🎪</span>
            Events
          </button>

        </div>

        {/* BOTTOM */}

        <div className="student-sidebar-bottom">

          <button className="student-menu-item">
            <span>⚙️</span>
            Settings
          </button>

          <button
            className="student-menu-item student-logout"
            onClick={onLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="student-main">

        {/* HEADER */}

        <header className="student-header">

          <div>

            <p className="student-page-label">
              STUDENT PORTAL
            </p>

            <h1>
              Good morning, {firstName} 👋
            </h1>

            <span>
              Here's what's happening with your academics today.
            </span>

          </div>


          <div className="student-profile">

            <div className="student-notification">
              🔔
              <span>0</span>
            </div>

            <div className="student-profile-avatar">
              {initials || "S"}
            </div>

            <div className="student-profile-info">

              <strong>
                {studentName}
              </strong>

              <small>
                Student
              </small>

            </div>

          </div>

        </header>


        {/* ================= SUMMARY ================= */}

        <section className="student-stats">

          <div className="student-stat-card">

            <div className="student-stat-top">

              <div className="student-stat-icon blue">
                📚
              </div>

              <span className="student-live">
                Active
              </span>

            </div>

            <p>My Subjects</p>

            <h2>—</h2>

            <small>
              Subjects will appear here
            </small>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-top">

              <div className="student-stat-icon green">
                ✓
              </div>

              <span className="student-live">
                Track
              </span>

            </div>

            <p>Attendance</p>

            <h2>—</h2>

            <small>
              Attendance module
            </small>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-top">

              <div className="student-stat-icon orange">
                📝
              </div>

              <span className="student-live">
                Upcoming
              </span>

            </div>

            <p>Assignments</p>

            <h2>—</h2>

            <small>
              No assignments connected
            </small>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-top">

              <div className="student-stat-icon purple">
                📋
              </div>

              <span className="student-live">
                Upcoming
              </span>

            </div>

            <p>Exams</p>

            <h2>—</h2>

            <small>
              Examination module
            </small>

          </div>

        </section>


        {/* ================= MAIN GRID ================= */}

        <section className="student-dashboard-grid">

          {/* TODAY'S TIMETABLE */}

          <div className="student-panel">

            <div className="student-panel-header">

              <div>
                <h3>
                  Today's Timetable
                </h3>

                <p>
                  Your classes for today
                </p>
              </div>

              <span className="student-setup-badge">
                Setup
              </span>

            </div>


            <div className="student-empty-list">

              <div className="student-empty-icon">
                📅
              </div>

              <h4>
                Timetable not connected
              </h4>

              <p>
                Your class schedule will appear here
                once the timetable module is connected.
              </p>

            </div>

          </div>


          {/* ATTENDANCE */}

          <div className="student-panel">

            <div className="student-panel-header">

              <div>
                <h3>
                  Attendance Overview
                </h3>

                <p>
                  Your academic attendance
                </p>
              </div>

              <span className="student-setup-badge">
                Setup
              </span>

            </div>


            <div className="student-attendance-placeholder">

              <div className="student-attendance-circle">

                <div>
                  <strong>—</strong>
                  <span>Overall</span>
                </div>

              </div>

              <div className="student-attendance-info">

                <div>
                  <span className="student-dot blue-dot"></span>
                  Present
                  <strong>—</strong>
                </div>

                <div>
                  <span className="student-dot red-dot"></span>
                  Absent
                  <strong>—</strong>
                </div>

                <div>
                  <span className="student-dot gray-dot"></span>
                  Not marked
                  <strong>—</strong>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= BOTTOM GRID ================= */}

        <section className="student-dashboard-grid student-bottom-grid">

          {/* ANNOUNCEMENTS */}

          <div className="student-panel">

            <div className="student-panel-header">

              <div>
                <h3>
                  Recent Announcements
                </h3>

                <p>
                  Latest campus updates
                </p>
              </div>

            </div>


            <div className="student-list">

              <div className="student-list-item">

                <div className="student-list-icon blue-bg">
                  📢
                </div>

                <div>
                  <strong>
                    No announcements yet
                  </strong>

                  <p>
                    New campus announcements will appear here.
                  </p>
                </div>

                <span>—</span>

              </div>

            </div>

          </div>


          {/* UPCOMING */}

          <div className="student-panel">

            <div className="student-panel-header">

              <div>
                <h3>
                  Upcoming
                </h3>

                <p>
                  Assignments and examinations
                </p>
              </div>

              <span className="student-setup-badge">
                Setup
              </span>

            </div>


            <div className="student-list">

              <div className="student-list-item">

                <div className="student-list-icon orange-bg">
                  📝
                </div>

                <div>
                  <strong>
                    Assignments
                  </strong>

                  <p>
                    Assignment module not connected.
                  </p>
                </div>

                <span>→</span>

              </div>


              <div className="student-list-item">

                <div className="student-list-icon purple-bg">
                  📋
                </div>

                <div>
                  <strong>
                    Examinations
                  </strong>

                  <p>
                    Examination module not connected.
                  </p>
                </div>

                <span>→</span>

              </div>

            </div>

          </div>

        </section>


        {/* ================= STUDENT ACCOUNT ================= */}

        <section className="student-account-panel">

          <div>

            <p className="student-account-label">
              ACCOUNT
            </p>

            <h3>
              {studentName}
            </h3>

            <span>
              {user?.email || "No email available"}
            </span>

          </div>


          <div className="student-account-role">
            STUDENT
          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;