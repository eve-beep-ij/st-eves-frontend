import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/appointments/my-patients/")
      .then((res) => setPatients(res.data))
      .catch(() => setError("Could not load your patients."))
      .finally(() => setLoading(false));
  }, []);

  const text = search.trim().toLowerCase();
  const shown = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(text) ||
      (p.email || "").toLowerCase().includes(text) ||
      (p.phone || "").includes(text)
  );

  return (
    <div className="container mt-4">
      <h2>My Patients</h2>
      <p className="text-muted">
        People who have booked an appointment with you.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && !error && (
        <>
          <input
            className="form-control mb-4"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {shown.length === 0 && <p className="text-muted">No patients found.</p>}

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {shown.map((p) => (
              <div className="col" key={p.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="mb-1">
                      <strong>Phone:</strong> {p.phone || "Not added"}
                    </p>
                    <p className="mb-1 text-break">
                      <strong>Email:</strong> {p.email || "Not added"}
                    </p>
                    <p className="mb-1">
                      <strong>Appointments:</strong> {p.visits}
                    </p>
                    <p className="mb-3">
                      <strong>Latest:</strong> {p.latest_date}
                    </p>
                    <Link
                      className="btn btn-outline-primary btn-sm"
                      to={`/doctor/patients/${p.id}`}
                    >
                      View details
                    </Link>
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

export default MyPatients;