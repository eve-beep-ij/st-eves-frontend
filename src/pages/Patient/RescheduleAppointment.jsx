import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";

function RescheduleAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Today's date as YYYY-MM-DD, in the visitor's own time zone
  const today = new Date().toLocaleDateString("en-CA");

  // Find this appointment among the patient's own appointments
  useEffect(() => {
    api
      .get("/appointments/")
      .then((res) => {
        const found = res.data.find((a) => String(a.id) === id);
        if (!found) setError("Appointment not found.");
        setAppointment(found || null);
      })
      .catch(() => setError("Could not load your appointment."))
      .finally(() => setLoading(false));
  }, [id]);

  // Load the doctor's free times whenever the date changes
  useEffect(() => {
    if (!appointment || !date) return;
    setLoadingSlots(true);
    api
      .get("/appointments/slots/", {
        params: { doctor: appointment.doctor, date },
      })
      .then((res) => setSlots(res.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [appointment, date, refreshKey]);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await api.post(`/appointments/${id}/reschedule/`, {
        date,
        start_time: selected,
      });
      navigate("/patient/appointments");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          data?.non_field_errors?.[0] ||
          "Could not reschedule. Please try again.",
      );
      setSelected("");
      setRefreshKey((k) => k + 1); // reload the times in case one was just taken
      setSaving(false);
    }
  };

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
        <Link to="/patient/appointments">← Back to my appointments</Link>
      </div>
    );
  }

  const canReschedule =
    appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to="/patient/appointments">← Back to my appointments</Link>

      <h2 className="mt-3">Reschedule Appointment</h2>
      <p className="text-muted">
        Currently: {appointment.date} at {appointment.start_time.slice(0, 5)}{" "}
        with {appointment.doctor_name}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {!canReschedule && (
        <div className="alert alert-info">
          A {appointment.status} appointment cannot be rescheduled.
        </div>
      )}

      {canReschedule && (
        <>
          <label className="form-label">Choose a new date</label>
          <input
            type="date"
            className="form-control mb-3"
            style={{ maxWidth: 220 }}
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelected("");
              setError("");
            }}
          />

          {date && loadingSlots && <p>Loading times...</p>}

          {date && !loadingSlots && slots.length === 0 && (
            <p className="text-muted">
              No free times on this day. Try another date within the doctor's
              working hours.
            </p>
          )}

          <div className="mb-3">
            {!loadingSlots &&
              slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`btn me-2 mb-2 ${
                    selected === slot ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setSelected(slot)}
                >
                  {slot}
                </button>
              ))}
          </div>

          {selected && (
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : `Move to ${date} at ${selected}`}
            </button>
          )}

          <p className="text-muted small mt-3">
            After you reschedule, the doctor will need to confirm the new time
            again.
          </p>
        </>
      )}
    </div>
  );
}

export default RescheduleAppointment;
