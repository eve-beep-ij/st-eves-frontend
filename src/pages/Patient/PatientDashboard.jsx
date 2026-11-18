import { useAuth } from "../../context/AuthContext";

function PatientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-4">
      <h2>Patient Dashboard</h2>
      <p>Welcome, {user?.first_name || user?.username}</p>
      <button className="btn btn-outline-secondary" onClick={logout}>
        Log out
      </button>
    </div>
  );
}

export default PatientDashboard;
