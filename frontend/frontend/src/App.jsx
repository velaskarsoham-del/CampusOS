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

      // Save login
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
  // SIGNUP
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

      // Signup successful
      setMessage(
        "Account created successfully. You can now sign in."
      );

      setMessageType("success");

      // Switch to sign in
      setMode("signin");

      // Keep email
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
    return (
      <div className="student-placeholder">
        <div className="student-placeholder-card">

          <div className="student-placeholder-icon">
            C
          </div>

          <h2>
            Welcome, {user.name || "Student"}
          </h2>

          <p>
            Your student account is connected successfully.
            The student dashboard will be connected next.
          </p>

          <button
            className="placeholder-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN / SIGNUP PAGE
  // =====================================================

  return (
    <div className="auth-page">

      {/* =================================================
          LEFT HERO
      ================================================= */}

      <div className="login-hero">

        {/* Decorative circles */}

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

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

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

            {/* =================================================
                SIGN IN
            ================================================= */}

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

            {/* =================================================
                SIGN UP
            ================================================= */}

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

          {/* =================================================
              MESSAGE
          ================================================= */}

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

          {/* =================================================
              SECURITY NOTE
          ================================================= */}

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