import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";

const badge = {
  pending: "bg-warning text-dark",
  confirmed: "bg-success",
  cancelled: "bg-secondary",
  completed: "bg-info text-dark",
};

function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/appointments/my-patients/${id}/`)
      .then((res) => setPatient(res.data))
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? "Patient not found."
            : "Could not load this patient."
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error || "Patient not found."}</div>
        <Link to="/doctor/patients">Back to my patients</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to="/doctor/patients">Back to my patients</Link>

      <h2 className="mt-3">{patient.name}</h2>

      <div className="card mb-4">
        <div className="card-body">
          <p className="mb-1">
            <strong>Phone:</strong> {patient.phone || "Not added"}
          </p>
          <p className="mb-0 text-break">
            <strong>Email:</strong> {patient.email || "Not added"}
          </p>
        </div>
      </div>

      <h4>Appointments with you</h4>
      {patient.appointments.map((a) => (
        <div className="card mb-2" key={a.id}>
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <strong>{a.date}</strong> at {a.start_time}
              <div className="text-muted">{a.reason || "No reason given"}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${badge[a.status]}`}>{a.status}</span>
              {a.status === "completed" && (
                <Link
                  className="btn btn-outline-primary btn-sm"
                  to={`/doctor/appointments/${a.id}`}
                >
                  Visit note
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientDetails;