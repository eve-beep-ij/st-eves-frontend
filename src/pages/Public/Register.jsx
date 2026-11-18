import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.post("/auth/register/", form);
      navigate("/login");
    } catch (err) {
      setErrors(err.response?.data || { detail: "Something went wrong." });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <h2 className="mb-4">Create your account</h2>
      <form onSubmit={handleSubmit}>
        {[
          "username",
          "email",
          "first_name",
          "last_name",
          "phone",
          "password",
        ].map((field) => (
          <div className="mb-3" key={field}>
            <input
              className="form-control"
              name={field}
              type={field === "password" ? "password" : "text"}
              placeholder={field.replace("_", " ")}
              value={form[field]}
              onChange={handleChange}
            />
            {errors[field] && (
              <div className="text-danger small">{errors[field]}</div>
            )}
          </div>
        ))}
        {errors.detail && (
          <div className="alert alert-danger">{errors.detail}</div>
        )}
        <button className="btn btn-primary w-100">Register</button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Register;
