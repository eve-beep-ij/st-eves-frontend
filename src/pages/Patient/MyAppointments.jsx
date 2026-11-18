import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";

const badge = {
  pending: "bg-warning text-dark",
  confirmed: "bg-success",
  cancelled: "bg-secondary",
  completed: "bg-info text-dark",
};

// The buttons for one appointment. Used by both the table and the cards.
function AppointmentActions({ a, onCancel }) {
  if (a.status !== "pending" && a.status !== "confirmed") return null;

  return (
    <>
      {a.status === "confirmed" && (
        <Link
          className="btn btn-outline-success btn-sm"
          to={`/appointments/${a.id}/call`}
        >
          Video call
        </Link>
      )}
      <Link
        className="btn btn-outline-primary btn-sm"
        to={`/patient/appointments/${a.id}/reschedule`}
      >
        Reschedule
      </Link>
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => onCancel(a.id)}
      >
        Cancel
      </button>
    </>
  );
}

// One section (Today, Upcoming or Past and closed)
function AppointmentSection({ title, rows, onCancel }) {
  return (
    <div className="mb-5">
      <h4>{title}</h4>
      {rows.length === 0 ? (
        <p className="text-muted">Nothing here.</p>
      ) : (
        <>
          {/* Table: tablets and bigger screens */}
          <div className="table-responsive d-none d-md-block">
            <table className="table align-middle" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "13%" }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td className="text-nowrap">{a.date}</td>
                    <td className="text-nowrap">{a.start_time.slice(0, 5)}</td>
                    <td>{a.doctor_name}</td>
                    <td>{a.reason || "-"}</td>
                    <td>
                      <span className={`badge ${badge[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <AppointmentActions a={a} onCancel={onCancel} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards: phones only */}
          <div className="d-md-none">
            {rows.map((a) => (
              <div className="card mb-3" key={a.id}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{a.date}</h6>
                      <small className="text-muted">
                        {a.start_time.slice(0, 5)}
                      </small>
                    </div>
                    <span className={`badge ${badge[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="mb-1">
                    <strong>Doctor:</strong> {a.doctor_name}
                  </p>
                  <p className="mb-3">
                    <strong>Reason:</strong> {a.reason || "-"}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <AppointmentActions a={a} onCancel={onCancel} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api
      .get("/appointments/")
      .then((res) => setAppointments(res.data))
      .catch(() => setError("Could not load your appointments."))
      .finally(() => setLoading(false));
  }, [reload]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.post(`/appointments/${id}/cancel/`);
      setReload((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not cancel.");
    }
  };

  const today = new Date().toLocaleDateString("en-CA");
  const isOpen = (a) => a.status === "pending" || a.status === "confirmed";

  const todays = appointments.filter((a) => a.date === today && isOpen(a));
  const upcoming = appointments.filter((a) => a.date > today && isOpen(a));
  const history = appointments.filter((a) => !isOpen(a) || a.date < today);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Appointments</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && appointments.length === 0 && (
        <p>You have no appointments yet.</p>
      )}

      {!loading && appointments.length > 0 && (
        <>
          <AppointmentSection title="Today" rows={todays} onCancel={handleCancel} />
          <AppointmentSection title="Upcoming" rows={upcoming} onCancel={handleCancel} />
          <AppointmentSection title="Past and closed" rows={history} onCancel={handleCancel} />
        </>
      )}
    </div>
  );
}

export default MyAppointments;