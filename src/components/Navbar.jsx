import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const dashboardPath =
    user?.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <Link className="navbar-brand" to="/" onClick={closeMenu}>
        St Eves
      </Link>

      {/* Hamburger button: only visible on small screens */}
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* The links: hidden on mobile until open is true */}
      <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
        <div className="navbar-nav ms-auto align-items-lg-center">
          <Link className="nav-link" to="/doctors" onClick={closeMenu}>
            Doctors
          </Link>

          {!user && (
            <>
              <Link className="nav-link" to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link className="nav-link" to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              {user.role === "patient" && (
                <>
                  <Link
                    className="nav-link"
                    to="/patient/appointments"
                    onClick={closeMenu}
                  >
                    My Appointments
                  </Link>
                  <Link
                    className="nav-link"
                    to="/patient/history"
                    onClick={closeMenu}
                  >
                    My Medical History
                  </Link>
                  <Link
                    className="nav-link"
                    to="/patient/profile"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>
                </>
              )}
              {user.role === "doctor" && (
                <>
                  <Link
                    className="nav-link"
                    to="/doctor/schedule"
                    onClick={closeMenu}
                  >
                    My Schedule
                  </Link>
                  <Link
                    className="nav-link"
                    to="/doctor/patients"
                    onClick={closeMenu}
                  >
                    My Patients
                  </Link>
                </>
              )}
              <Link className="nav-link" to="/calendar" onClick={closeMenu}>
                Calendar
              </Link>
              <Link className="nav-link" to={dashboardPath} onClick={closeMenu}>
                Dashboard
              </Link>
              <span className="navbar-text mx-lg-2">
                {user.first_name || user.username} ({user.role})
              </span>
              <button
                className="btn btn-light btn-sm mt-2 mt-lg-0"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;