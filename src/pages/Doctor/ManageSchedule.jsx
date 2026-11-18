import { useEffect, useState } from "react";
import api from "../../api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Turns Django's error reply into one readable sentence
function readError(err) {
  const data = err.response?.data;
  if (!data || typeof data === "string") {
    return "Something went wrong. Please try again.";
  }
  if (data.detail) return data.detail;
  return Object.values(data).flat().join(" ");
}

function ManageSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState({
    weekday: "0",
    start_time: "09:00",
    end_time: "17:00",
    slot_minutes: "30",
  });

  // Load the doctor's working hours when the page opens (and after every change)
  useEffect(() => {
    api
      .get("/doctors/schedules/")
      .then((res) => setSchedules(res.data))
      .catch(() => setError("Could not load your schedule."))
      .finally(() => setLoading(false));
  }, [reload]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/doctors/schedules/", {
        weekday: Number(form.weekday),
        start_time: form.start_time,
        end_time: form.end_time,
        slot_minutes: Number(form.slot_minutes),
      });
      setReload((r) => r + 1);
    } catch (err) {
      setError(readError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove these working hours?")) return;
    setError("");
    try {
      await api.delete(`/doctors/schedules/${id}/`);
      setReload((r) => r + 1);
    } catch (err) {
      setError(readError(err));
    }
  };

  return (
    <div className="container mt-4">
      <h2>My schedule</h2>
      <p className="text-muted">
        Patients can only book times inside these hours.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <div className="mb-5">
          <h4>Working hours</h4>
          {schedules.length === 0 ? (
            <p className="text-muted">You have not set any hours yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Hours</th>
                    <th>Slot length</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td>{s.weekday_name}</td>
                      <td>
                        {s.start_time.slice(0, 5)} to {s.end_time.slice(0, 5)}
                      </td>
                      <td>{s.slot_minutes} min</td>
                      <td className="text-nowrap">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <h4>Add working hours</h4>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Day</label>
          <select
            className="form-select"
            name="weekday"
            value={form.weekday}
            onChange={handleChange}
          >
            {DAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Start</label>
          <input
            type="time"
            className="form-control"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End</label>
          <input
            type="time"
            className="form-control"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Slot length (minutes)</label>
          <input
            type="number"
            min="10"
            step="5"
            className="form-control"
            name="slot_minutes"
            value={form.slot_minutes}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Add hours"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ManageSchedule;
