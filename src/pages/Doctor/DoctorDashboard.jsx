import { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const badge = {
  pending: "bg-warning text-dark",
  confirmed: "bg-success",
  cancelled: "bg-secondary",
  completed: "bg-info text-dark",
};

// The buttons for one appointment. Used by both the table and the cards.
function AppointmentActions({ a, onAction }) {
  const { user } = useAuth();
  const isStaff = user?.role === "staff";

  return (
    <>
      {a.status === "pending" && (
        <button
          className="btn btn-success btn-sm"
          onClick={() => onAction(a.id, "status", "confirmed")}
        >
          Confirm
        </button>
      )}
      {a.status === "confirmed" && !isStaff && (
        <button
          className="btn btn-info btn-sm"
          onClick={() => onAction(a.id, "status", "completed")}
        >
          Complete
        </button>
      )}
      {a.status === "confirmed" && !isStaff && (
        <Link
          className="btn btn-outline-success btn-sm"
          to={`/appointments/${a.id}/call`}
        >
          Video call
        </Link>
      )}
      {(a.status === "pending" || a.status === "confirmed") && (
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onAction(a.id, "cancel")}
        >
          Cancel
        </button>
      )}
      {a.status === "completed" && !isStaff && (
        <Link
          className="btn btn-outline-primary btn-sm"
          to={`/doctor/appointments/${a.id}`}
        >
          Visit note
        </Link>
      )}
    </>
  );
}

function AppointmentTable({ title, rows, onAction, showPatient }) {
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
                <col style={{ width: "13%" }} />
                <col style={{ width: "8%" }} />
                {showPatient && <col style={{ width: "17%" }} />}
                <col style={{ width: "15%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "12%" }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  {showPatient && <th>Patient</th>}
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
                    {showPatient && <td>{a.patient_name}</td>}
                    <td>{a.doctor_name}</td>
                    <td>{a.reason || "-"}</td>
                    <td>
                      <span className={`badge ${badge[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <AppointmentActions a={a} onAction={onAction} />
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
                  {showPatient && (
                    <p className="mb-1">
                      <strong>Patient:</strong> {a.patient_name}
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>Doctor:</strong> {a.doctor_name}
                  </p>
                  <p className="mb-3">
                    <strong>Reason:</strong> {a.reason || "-"}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <AppointmentActions a={a} onAction={onAction} />
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

function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api
      .get("/appointments/")
      .then((res) => setAppointments(res.data))
      .catch(() => setError("Could not load appointments."))
      .finally(() => setLoading(false));
  }, [reload]);

  const handleAction = async (id, kind, newStatus) => {
    setError("");
    try {
      if (kind === "cancel") {
        if (!window.confirm("Cancel this appointment?")) return;
        await api.post(`/appointments/${id}/cancel/`);
      } else {
        await api.post(`/appointments/${id}/status/`, { status: newStatus });
      }
      setReload((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.detail || "That action failed.");
    }
  };

  const today = new Date().toLocaleDateString("en-CA");
  const isOpen = (a) => a.status === "pending" || a.status === "confirmed";

  const todays = appointments.filter((a) => a.date === today && isOpen(a));
  const upcoming = appointments.filter((a) => a.date > today && isOpen(a));
  const history = appointments.filter((a) => !isOpen(a) || a.date < today);

  return (
    <div className="container mt-4">
      <h2>Doctor Dashboard</h2>
      <p className="text-muted">
        Welcome, {user?.first_name || user?.username}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <AppointmentTable
            title="Today"
            rows={todays}
            onAction={handleAction}
            showPatient
          />
          <AppointmentTable
            title="Upcoming"
            rows={upcoming}
            onAction={handleAction}
            showPatient
          />
          <AppointmentTable
            title="Past and closed"
            rows={history}
            onAction={handleAction}
            showPatient
          />
        </>
      )}
    </div>
  );
}

export default DoctorDashboard;