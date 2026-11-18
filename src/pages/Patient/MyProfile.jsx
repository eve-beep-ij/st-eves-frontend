import { useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function MyProfile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const show = (value) => value || "Not added yet";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.patch("/auth/me/", form);
      setUser(res.data);
      setEditing(false);
      setSuccess("Your profile has been updated.");
    } catch (err) {
      // Django sends errors like { email: ["Enter a valid email address."] }
      const data = err.response?.data;
      const firstError = data ? Object.values(data)[0] : null;
      setError(
        (Array.isArray(firstError) ? firstError[0] : firstError) ||
          "Could not save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2 className="mb-3">My Profile</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-body">
          {!editing && (
            <>
              <p className="mb-2">
                <strong>First name:</strong> {show(user?.first_name)}
              </p>
              <p className="mb-2">
                <strong>Last name:</strong> {show(user?.last_name)}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {show(user?.email)}
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> {show(user?.phone)}
              </p>
              <p className="mb-3 text-muted">
                <strong>Username:</strong> {user?.username}
              </p>
              <button className="btn btn-primary" onClick={startEditing}>
                Edit profile
              </button>
            </>
          )}

          {editing && (
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">First name</label>
                <input
                  className="form-control"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last name</label>
                <input
                  className="form-control"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;