import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function AppointmentDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({ summary: "", advice: "", follow_up: "" });
  const [hasNote, setHasNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the appointment, and its note if one exists
  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.get("/appointments/");
        const found = list.data.find((a) => String(a.id) === id);
        if (!found) {
          setError("Appointment not found.");
          return;
        }
        setAppointment(found);

        if (found.status === "completed") {
          const note = await api.get(`/records/appointment/${id}/`);
          setForm({
            summary: note.data.summary || "",
            advice: note.data.advice || "",
            follow_up: note.data.follow_up || "",
          });
          setHasNote(Boolean(note.data.id));
        }
      } catch {
        setError("Could not load this appointment.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.put(`/records/appointment/${id}/`, form);
      setHasNote(true);
      setSuccess("Note saved. The patient can now see it under My history.");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail || data?.summary?.[0] || "Could not save the note."
      );
    } finally {
      setSaving(false);
    }
  };

  // Staff are not allowed to read or write visit notes
  if (user?.role === "staff") {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Staff cannot view visit notes.
        </div>
        <Link to="/doctor/dashboard">← Back to dashboard</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error || "Appointment not found."}
        </div>
        <Link to="/doctor/dashboard">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to="/doctor/dashboard">← Back to dashboard</Link>

      <h2 className="mt-3">Visit note</h2>
      <p className="text-muted">
        {appointment.patient_name} · {appointment.date} at{" "}
        {appointment.start_time.slice(0, 5)} ·{" "}
        <span className="text-capitalize">{appointment.status}</span>
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {appointment.status !== "completed" && (
        <div className="alert alert-info">
          You can write a note after this appointment is marked completed.
        </div>
      )}

      {appointment.status === "completed" && (
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">Summary (required)</label>
            <textarea
              className="form-control"
              name="summary"
              rows="4"
              placeholder="What was discussed, findings, diagnosis"
              value={form.summary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Advice</label>
            <textarea
              className="form-control"
              name="advice"
              rows="3"
              placeholder="Instructions for the patient"
              value={form.advice}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Follow-up</label>
            <input
              className="form-control"
              name="follow_up"
              placeholder="e.g. Review in 4 weeks"
              value={form.follow_up}
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : hasNote ? "Update note" : "Save note"}
          </button>
          <Link
            to={`/doctor/appointments/${id}/prescription`}
            className="btn btn-outline-primary ms-2"
          >
            Write prescription
          </Link>
        </form>
      )}
    </div>
  );
}

export default AppointmentDetails;