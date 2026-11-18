import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(username, password);
      navigate(
        user.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard",
      );
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Wrong username or password.");
      } else if (err.response) {
        setError("Logged in, but the server refused to load your profile.");
      } else {
        setError("Cannot reach the server. Is Django running?");
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100">Log in</button>
      </form>
    </div>
  );
}

export default Login;
