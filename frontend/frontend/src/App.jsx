import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // =====================================================
  // AUTH STATE
  // =====================================================

  const [mode, setMode] = useState("signin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // =====================================================
  // FORM STATE
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  // =====================================================
  // UI STATE
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // RESTORE LOGIN AFTER REFRESH
  // =====================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Unable to restore login:", error);
      localStorage.removeItem("user");
    }
  }, []);

  // =====================================================
  // SWITCH SIGN IN / SIGN UP
  // =====================================================

  const switchMode = (newMode) => {
    setMode(newMode);

    setMessage("");
    setMessageType("error");

    setEmail("");
    setPassword("");
    setName("");
    setRole("student");

    setShowPassword(false);
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("error");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password");
        setMessageType("error");
        return;
      }

      if (!data.user) {
        setMessage(
          "Login succeeded but user information was not returned."
        );
        setMessageType("error");
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsLoggedIn(true);

      setMessage("");
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to CampusOS server. Make sure the backend is running."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SIGN UP
  // =====================================================

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("error");

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create account.");
        setMessageType("error");
        return;
      }

      setMessage(
        "Account created successfully. You can now sign in."
      );

      setMessageType("success");

      setMode("signin");

      setEmail(email.trim().toLowerCase());

      setPassword("");
      setName("");
      setRole("student");
      setShowPassword(false);
    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        "Unable to connect to CampusOS server. Make sure the backend is running."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");

    setUser(null);
    setIsLoggedIn(false);

    setEmail("");
    setPassword("");
    setName("");

    setMessage("");
    setMessageType("error");

    setMode("signin");
    setShowPassword(false);
  };

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  const StudentDashboard = ({ user, onLogout }) => {
    const studentName = user?.name || "Student";

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f8fc",
          fontFamily: "Arial, sans-serif",
          display: "flex",
        }}
      >
        {/* SIDEBAR */}

        <aside
          style={{
            width: "285px",
            background: "#101a2f",
            color: "white",
            minHeight: "100vh",
            padding: "25px 18px",
            boxSizing: "border-box",
          }}
        >
          {/* BRAND */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "45px",
              paddingLeft: "10px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#2864e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              C
            </div>

            <span
              style={{
                fontSize: "23px",
                fontWeight: "800",
              }}
            >
              CampusOS
            </span>
          </div>

          {/* MENU */}

          <div
            style={{
              color: "#8390a8",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "1px",
              paddingLeft: "12px",
              marginBottom: "12px",
            }}
          >
            STUDENT PORTAL
          </div>

          <div
            style={{
              background: "#2864e8",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🏠 &nbsp; Dashboard
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            👤 &nbsp; My Profile
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            📅 &nbsp; Attendance
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            💰 &nbsp; Fees
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            📝 &nbsp; Exams
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            📚 &nbsp; Library
          </div>

          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              color: "#d4dbea",
            }}
          >
            📢 &nbsp; Events
          </div>

          {/* LOGOUT */}

          <button
            onClick={onLogout}
            style={{
              position: "absolute",
              bottom: "25px",
              left: "18px",
              width: "249px",
              border: "none",
              background: "transparent",
              color: "#ff8d8d",
              padding: "15px",
              textAlign: "left",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ↪ &nbsp; Logout
          </button>
        </aside>

        {/* MAIN CONTENT */}

        <main
          style={{
            flex: 1,
            padding: "40px 45px",
            overflow: "auto",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#60708b",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                STUDENT PORTAL
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "38px",
                  color: "#10213d",
                }}
              >
                Welcome, {studentName} 👋
              </h1>

              <p
                style={{
                  color: "#71809a",
                  fontSize: "16px",
                  marginTop: "10px",
                }}
              >
                Here's what's happening with your campus journey.
              </p>
            </div>

            {/* USER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: "#e7efff",
                  color: "#2864e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "20px",
                }}
              >
                {studentName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong
                  style={{
                    color: "#10213d",
                    display: "block",
                  }}
                >
                  {studentName}
                </strong>

                <span
                  style={{
                    color: "#71809a",
                    fontSize: "14px",
                  }}
                >
                  Student
                </span>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                }}
              >
                📅
              </div>

              <p
                style={{
                  color: "#71809a",
                  margin: 0,
                }}
              >
                Attendance
              </p>

              <h2
                style={{
                  margin: "8px 0",
                  color: "#10213d",
                }}
              >
                —
              </h2>

              <span
                style={{
                  color: "#8996aa",
                  fontSize: "13px",
                }}
              >
                Attendance module
              </span>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                }}
              >
                💰
              </div>

              <p
                style={{
                  color: "#71809a",
                  margin: 0,
                }}
              >
                Fees
              </p>

              <h2
                style={{
                  margin: "8px 0",
                  color: "#10213d",
                }}
              >
                —
              </h2>

              <span
                style={{
                  color: "#8996aa",
                  fontSize: "13px",
                }}
              >
                Fee details
              </span>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                }}
              >
                📝
              </div>

              <p
                style={{
                  color: "#71809a",
                  margin: 0,
                }}
              >
                Exams
              </p>

              <h2
                style={{
                  margin: "8px 0",
                  color: "#10213d",
                }}
              >
                —
              </h2>

              <span
                style={{
                  color: "#8996aa",
                  fontSize: "13px",
                }}
              >
                Examination details
              </span>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                }}
              >
                🎓
              </div>

              <p
                style={{
                  color: "#71809a",
                  margin: 0,
                }}
              >
                Campus Credits
              </p>

              <h2
                style={{
                  margin: "8px 0",
                  color: "#10213d",
                }}
              >
                —
              </h2>

              <span
                style={{
                  color: "#8996aa",
                  fontSize: "13px",
                }}
              >
                Credits earned
              </span>
            </div>
          </div>

          {/* MAIN PANELS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 2fr) minmax(280px, 1fr)",
              gap: "25px",
            }}
          >
            {/* PROFILE */}

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "30px",
              }}
            >
              <h2
                style={{
                  color: "#10213d",
                  marginTop: 0,
                }}
              >
                My Profile
              </h2>

              <p
                style={{
                  color: "#71809a",
                  marginBottom: "25px",
                }}
              >
                Your registered CampusOS account information.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "20px",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#8996aa",
                      fontSize: "13px",
                    }}
                  >
                    Name
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#10213d",
                    }}
                  >
                    {user.name || "Not available"}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#8996aa",
                      fontSize: "13px",
                    }}
                  >
                    Email
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#10213d",
                    }}
                  >
                    {user.email || "Not available"}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#8996aa",
                      fontSize: "13px",
                    }}
                  >
                    Account Type
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#10213d",
                      textTransform: "capitalize",
                    }}
                  >
                    {user.role || "Student"}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#8996aa",
                      fontSize: "13px",
                    }}
                  >
                    Account Status
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#10a779",
                    }}
                  >
                    ● Active
                  </strong>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "30px",
              }}
            >
              <h2
                style={{
                  color: "#10213d",
                  marginTop: 0,
                }}
              >
                Quick Access
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  style={{
                    border: "none",
                    background: "#f1f5ff",
                    padding: "15px",
                    borderRadius: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  📅 &nbsp; View Attendance
                </button>

                <button
                  style={{
                    border: "none",
                    background: "#f1f5ff",
                    padding: "15px",
                    borderRadius: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  📝 &nbsp; View Exams
                </button>

                <button
                  style={{
                    border: "none",
                    background: "#f1f5ff",
                    padding: "15px",
                    borderRadius: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  📚 &nbsp; Open Library
                </button>

                <button
                  style={{
                    border: "none",
                    background: "#f1f5ff",
                    padding: "15px",
                    borderRadius: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  📢 &nbsp; Campus Events
                </button>
              </div>
            </div>
          </div>

          {/* NOTICE */}

          <div
            style={{
              marginTop: "25px",
              background: "#fff8ed",
              border: "1px solid #f6dfb9",
              borderRadius: "16px",
              padding: "20px 25px",
              color: "#805b25",
            }}
          >
            <strong>CampusOS Student Portal</strong>

            <p
              style={{
                marginBottom: 0,
                marginTop: "7px",
              }}
            >
              Your account is connected successfully. Student
              modules such as attendance, exams, fees and library
              will appear here as they are connected to the system.
            </p>
          </div>
        </main>
      </div>
    );
  };

  // =====================================================
  // LOGGED-IN DASHBOARDS
  // =====================================================

  if (isLoggedIn && user) {
    // ADMIN
    if (user.role === "admin") {
      return (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }

    // TEACHER / FACULTY
    if (
      user.role === "teacher" ||
      user.role === "faculty"
    ) {
      return (
        <TeacherDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }

    // STUDENT
    if (user.role === "student") {
      return (
        <StudentDashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    }
  }

  // =====================================================
  // LOGIN / SIGNUP PAGE
  // =====================================================

  return (
    <div className="auth-page">

      {/* LEFT HERO */}

      <div className="login-hero">

        <div className="hero-background-circle hero-circle-one" />
        <div className="hero-background-circle hero-circle-two" />

        <div className="hero-content">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-icon">
              C
            </div>

            <span className="brand-name">
              CampusOS
            </span>

          </div>

          {/* HERO TEXT */}

          <div className="hero-text">

            <p className="eyebrow">
              SMART CAMPUS MANAGEMENT
            </p>

            <h1>
              One campus.
              <br />
              <span>
                One platform.
              </span>
            </h1>

            <p>
              Manage students, attendance, fees,
              exams, library, events and campus
              services from one integrated system.
            </p>

          </div>

          {/* FEATURES */}

          <div className="feature-list">

            <div className="feature-card">

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">

                <h3>
                  Student Management
                </h3>

                <p>
                  Everything about your students
                  in one place.
                </p>

              </div>

            </div>

            <div className="feature-card">

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">

                <h3>
                  Smart Attendance
                </h3>

                <p>
                  Track attendance and identify
                  students who need attention.
                </p>

              </div>

            </div>

            <div className="feature-card">

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">

                <h3>
                  Campus Credits
                </h3>

                <p>
                  Reward students for participation
                  and achievements.
                </p>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="hero-footer">

            <span>
              Integrated Student Management System
            </span>

            <span className="footer-dot">
              •
            </span>

            <span>
              CampusOS
            </span>

          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="login-section">

        <div className="login-container">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="brand-icon">
              C
            </div>

            <span className="brand-name">
              CampusOS
            </span>

          </div>

          {/* AUTH SWITCH */}

          <div className="auth-switch">

            <button
              type="button"
              className={
                mode === "signin"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode("signin")
              }
            >
              Sign In
            </button>

            <button
              type="button"
              className={
                mode === "signup"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode("signup")
              }
            >
              Sign Up
            </button>

          </div>

          <div className="auth-form-area">

            {/* SIGN IN */}

            {mode === "signin" && (
              <>

                <div className="login-heading">

                  <span className="heading-eyebrow">
                    WELCOME BACK
                  </span>

                  <h2>
                    Sign in to your account
                  </h2>

                  <p>
                    Enter your credentials to access
                    the campus portal.
                  </p>

                </div>

                <form
                  className="auth-form"
                  onSubmit={handleLogin}
                >

                  {/* EMAIL */}

                  <div className="input-group">

                    <label>
                      Email address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="admin@campusos.com"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                        autoComplete="email"
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="input-group">

                    <div className="password-label">

                      <label>
                        Password
                      </label>

                      <button
                        type="button"
                        className="show-password"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ●
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        required
                        autoComplete="current-password"
                      />

                    </div>

                  </div>

                  {/* OPTIONS */}

                  <div className="login-options">

                    <label className="remember">

                      <input
                        type="checkbox"
                      />

                      <span>
                        Remember me
                      </span>

                    </label>

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => {
                        setMessage(
                          "Password reset will be available soon."
                        );
                        setMessageType("error");
                      }}
                    >
                      Forgot password?
                    </button>

                  </div>

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >

                    {loading
                      ? "Signing in..."
                      : "Sign in"}

                    {!loading && (
                      <span className="button-arrow">
                        →
                      </span>
                    )}

                  </button>

                </form>

              </>
            )}

            {/* SIGN UP */}

            {mode === "signup" && (
              <>

                <div className="login-heading">

                  <span className="heading-eyebrow">
                    JOIN CAMPUSOS
                  </span>

                  <h2>
                    Create your account
                  </h2>

                  <p>
                    Register your details to access
                    the campus portal.
                  </p>

                </div>

                <form
                  className="auth-form"
                  onSubmit={handleSignup}
                >

                  {/* NAME */}

                  <div className="input-group">

                    <label>
                      Full name
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ●
                      </span>

                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                        autoComplete="name"
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="input-group">

                    <label>
                      Email address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                        autoComplete="email"
                      />

                    </div>

                  </div>

                  {/* ACCOUNT TYPE */}

                  <div className="input-group">

                    <label>
                      Account type
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ◆
                      </span>

                      <select
                        value={role}
                        onChange={(e) =>
                          setRole(e.target.value)
                        }
                      >

                        <option value="student">
                          Student
                        </option>

                        <option value="faculty">
                          Faculty
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="input-group">

                    <div className="password-label">

                      <label>
                        Password
                      </label>

                      <button
                        type="button"
                        className="show-password"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ●
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />

                    </div>

                  </div>

                  {/* SIGNUP BUTTON */}

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >

                    {loading
                      ? "Creating account..."
                      : "Create account"}

                    {!loading && (
                      <span className="button-arrow">
                        →
                      </span>
                    )}

                  </button>

                </form>

              </>
            )}

          </div>

          {/* MESSAGE */}

          {message && (
            <div
              className={`login-message ${
                messageType === "success"
                  ? "success"
                  : "error"
              }`}
            >
              {message}
            </div>
          )}

          {/* SECURITY NOTE */}

          <div className="security-note">

            <span>
              🔒
            </span>

            <p>
              Your campus data is protected
              and securely managed.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;