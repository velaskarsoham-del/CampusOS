import { useEffect, useState } from "react";

import "./AdminDashboard.css";

import Students from "./Students";
import Teachers from "./Teachers";
import Attendance from "./Attendance";

const API_URL = "http://localhost:5000";

function AdminDashboard({
  user,
  onLogout,
}) {
  // -------------------------------------------------
  // ACTIVE PAGE
  // -------------------------------------------------

  const [activePage, setActivePage] =
    useState("dashboard");

  // -------------------------------------------------
  // DASHBOARD COUNTS
  // -------------------------------------------------

  const [studentsCount, setStudentsCount] =
    useState(0);

  const [teachersCount, setTeachersCount] =
    useState(0);

  const [loadingStats, setLoadingStats] =
    useState(true);

  // -------------------------------------------------
  // LOAD DASHBOARD DATA
  // -------------------------------------------------

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);

      const [
        studentsResponse,
        teachersResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/teachers`),
      ]);

      if (!studentsResponse.ok) {
        throw new Error(
          "Unable to fetch students"
        );
      }

      if (!teachersResponse.ok) {
        throw new Error(
          "Unable to fetch teachers"
        );
      }

      const studentsData =
        await studentsResponse.json();

      const teachersData =
        await teachersResponse.json();

      setStudentsCount(
        Array.isArray(studentsData)
          ? studentsData.length
          : 0
      );

      setTeachersCount(
        Array.isArray(teachersData)
          ? teachersData.length
          : 0
      );

    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setStudentsCount(0);
      setTeachersCount(0);

    } finally {
      setLoadingStats(false);
    }
  };

  // -------------------------------------------------
  // LOAD DASHBOARD WHEN HOME IS OPEN
  // -------------------------------------------------

  useEffect(() => {
    if (
      activePage === "dashboard"
    ) {
      loadDashboardData();
    }
  }, [activePage]);

  // -------------------------------------------------
  // NAVIGATION
  // -------------------------------------------------

  const openDashboard = () => {
    setActivePage("dashboard");
  };

  const openStudents = () => {
    setActivePage("students");
  };

  const openTeachers = () => {
    setActivePage("teachers");
  };

  const openAttendance = () => {
    setActivePage("attendance");
  };

  // -------------------------------------------------
  // DASHBOARD HOME
  // -------------------------------------------------

  const DashboardHome = () => {
    return (
      <>
        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <p className="page-label">
              ADMIN PORTAL
            </p>

            <h1>
              Good morning,{" "}
              {user?.name || "Admin"} 👋
            </h1>

            <span>
              Here's what's happening across
              your campus today.
            </span>

          </div>

          <div className="admin-profile">

            <div className="notification">
              🔔
              <span>
                0
              </span>
            </div>

            <div className="profile-avatar">
              {(user?.name || "Admin")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-info">

              <strong>
                {user?.name || "Admin"}
              </strong>

              <small>
                Administrator
              </small>

            </div>

          </div>

        </header>

        {/* STAT CARDS */}

        <section className="stats-grid">

          {/* STUDENTS */}

          <div
            className="stat-card clickable-card"
            onClick={
              openStudents
            }
          >

            <div className="stat-top">

              <span className="stat-icon blue">
                👨‍🎓
              </span>

              <span className="stat-change positive">
                Live
              </span>

            </div>

            <p>
              Total Students
            </p>

            <h2>
              {loadingStats
                ? "..."
                : studentsCount.toLocaleString()}
            </h2>

            <small>
              Registered in database
            </small>

          </div>

          {/* TEACHERS */}

          <div
            className="stat-card clickable-card"
            onClick={
              openTeachers
            }
          >

            <div className="stat-top">

              <span className="stat-icon green">
                👨‍🏫
              </span>

              <span className="stat-change positive">
                Live
              </span>

            </div>

            <p>
              Total Teachers
            </p>

            <h2>
              {loadingStats
                ? "..."
                : teachersCount.toLocaleString()}
            </h2>

            <small>
              Registered in database
            </small>

          </div>

          {/* ATTENDANCE */}

          <div
            className="stat-card clickable-card"
            onClick={
              openAttendance
            }
          >

            <div className="stat-top">

              <span className="stat-icon orange">
                ✓
              </span>

              <span className="stat-change positive">
                Live
              </span>

            </div>

            <p>
              Attendance
            </p>

            <h2>
              →
            </h2>

            <small>
              Open attendance module
            </small>

          </div>

          {/* FEES */}

          <div className="stat-card">

            <div className="stat-top">

              <span className="stat-icon purple">
                ₹
              </span>

              <span className="stat-change">
                Setup
              </span>

            </div>

            <p>
              Fees Collected
            </p>

            <h2>
              —
            </h2>

            <small>
              Fees module not connected yet
            </small>

          </div>

        </section>

        {/* MAIN PANELS */}

        <section className="dashboard-grid">

          {/* CAMPUS OVERVIEW */}

          <div className="panel attendance-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Campus Overview
                </h3>

                <p>
                  Current database records
                </p>

              </div>

            </div>

            <div className="attendance-content">

              <div className="attendance-circle">

                <div>

                  <strong>
                    {loadingStats
                      ? "..."
                      : studentsCount}
                  </strong>

                  <span>
                    Students
                  </span>

                </div>

              </div>

              <div className="attendance-legend">

                <div>

                  <span className="legend-dot high"></span>

                  <p>
                    Students
                  </p>

                  <strong>
                    {loadingStats
                      ? "..."
                      : studentsCount}
                  </strong>

                </div>

                <div>

                  <span className="legend-dot medium"></span>

                  <p>
                    Teachers
                  </p>

                  <strong>
                    {loadingStats
                      ? "..."
                      : teachersCount}
                  </strong>

                </div>

                <div>

                  <span className="legend-dot low"></span>

                  <p>
                    Other modules
                  </p>

                  <strong>
                    Setup
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* ATTENTION REQUIRED */}

          <div className="panel alerts-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Attention Required
                </h3>

                <p>
                  Modules requiring setup
                </p>

              </div>

              <span className="alert-count">
                3
              </span>

            </div>

            <div className="alert-list">

              <div
                className="alert-item"
                onClick={
                  openAttendance
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <div className="alert-icon orange">
                  ✓
                </div>

                <div>

                  <strong>
                    Attendance
                  </strong>

                  <p>
                    Manage student attendance
                  </p>

                </div>

                <span>
                  →
                </span>

              </div>

              <div className="alert-item">

                <div className="alert-icon orange">
                  ₹
                </div>

                <div>

                  <strong>
                    Fees
                  </strong>

                  <p>
                    Fee module not connected
                  </p>

                </div>

                <span>
                  →
                </span>

              </div>

              <div className="alert-item">

                <div className="alert-icon blue">
                  📝
                </div>

                <div>

                  <strong>
                    Exams
                  </strong>

                  <p>
                    Examination module not connected
                  </p>

                </div>

                <span>
                  →
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* BOTTOM */}

        <section className="dashboard-grid bottom-grid">

          {/* QUICK ACTIONS */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Quick Actions
                </h3>

                <p>
                  Frequently used campus operations
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <button
                onClick={
                  openStudents
                }
              >
                <span>
                  ＋
                </span>

                Add Student
              </button>

              <button
                onClick={
                  openTeachers
                }
              >
                <span>
                  👨‍🏫
                </span>

                Manage Teachers
              </button>

              <button
                onClick={
                  openAttendance
                }
              >
                <span>
                  📅
                </span>

                Attendance
              </button>

              <button
                onClick={() =>
                  alert(
                    "Fees module will be connected next."
                  )
                }
              >
                <span>
                  💰
                </span>

                Fees
              </button>

            </div>

          </div>

          {/* SYSTEM STATUS */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  System Status
                </h3>

                <p>
                  CampusOS module status
                </p>

              </div>

            </div>

            <div className="activity-list">

              <div className="activity">

                <div className="activity-icon">
                  👨‍🎓
                </div>

                <div>

                  <strong>
                    Students
                  </strong>

                  <p>
                    Connected to database
                  </p>

                </div>

                <span className="status-online">
                  Live
                </span>

              </div>

              <div className="activity">

                <div className="activity-icon">
                  👨‍🏫
                </div>

                <div>

                  <strong>
                    Teachers
                  </strong>

                  <p>
                    Connected to database
                  </p>

                </div>

                <span className="status-online">
                  Live
                </span>

              </div>

              <div className="activity">

                <div className="activity-icon">
                  📅
                </div>

                <div>

                  <strong>
                    Attendance
                  </strong>

                  <p>
                    Attendance database connected
                  </p>

                </div>

                <span className="status-online">
                  Live
                </span>

              </div>

              <div className="activity">

                <div className="activity-icon">
                  💰
                </div>

                <div>

                  <strong>
                    Fees
                  </strong>

                  <p>
                    Database integration pending
                  </p>

                </div>

                <span className="status-pending">
                  Pending
                </span>

              </div>

            </div>

          </div>

        </section>
      </>
    );
  };

  // -------------------------------------------------
  // MAIN PAGE
  // -------------------------------------------------

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            C
          </div>

          <span>
            CampusOS
          </span>

        </div>

        {/* MAIN MENU */}

        <div className="menu-section">

          <p>
            MAIN MENU
          </p>

          <button
            className={`menu-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={
              openDashboard
            }
          >
            <span>
              ▦
            </span>

            Dashboard
          </button>

          <button
            className={`menu-item ${
              activePage === "students"
                ? "active"
                : ""
            }`}
            onClick={
              openStudents
            }
          >
            <span>
              👨‍🎓
            </span>

            Students
          </button>

          <button
            className={`menu-item ${
              activePage === "teachers"
                ? "active"
                : ""
            }`}
            onClick={
              openTeachers
            }
          >
            <span>
              👨‍🏫
            </span>

            Teachers
          </button>

          <button
            className={`menu-item ${
              activePage === "attendance"
                ? "active"
                : ""
            }`}
            onClick={
              openAttendance
            }
          >
            <span>
              📅
            </span>

            Attendance
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Fees module will be connected next."
              )
            }
          >
            <span>
              💰
            </span>

            Fees
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Exams module will be connected next."
              )
            }
          >
            <span>
              📝
            </span>

            Exams
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Library module will be connected next."
              )
            }
          >
            <span>
              📚
            </span>

            Library
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Timetable module will be connected next."
              )
            }
          >
            <span>
              🕐
            </span>

            Timetable
          </button>

        </div>

        {/* CAMPUS */}

        <div className="menu-section">

          <p>
            CAMPUS
          </p>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Train Concession module will be connected next."
              )
            }
          >
            <span>
              🚆
            </span>

            Train Concession
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Campus Credits module will be connected next."
              )
            }
          >
            <span>
              🪙
            </span>

            Campus Credits
          </button>

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Events module will be connected next."
              )
            }
          >
            <span>
              🎪
            </span>

            Events
          </button>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <button
            className="menu-item"
            onClick={() =>
              alert(
                "Settings will be connected next."
              )
            }
          >
            <span>
              ⚙️
            </span>

            Settings
          </button>

          <button
            className="menu-item logout"
            onClick={
              onLogout
            }
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {activePage === "students" ? (
          <Students />
        ) : activePage === "teachers" ? (
          <Teachers />
        ) : activePage === "attendance" ? (
          <Attendance />
        ) : (
          <DashboardHome />
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;