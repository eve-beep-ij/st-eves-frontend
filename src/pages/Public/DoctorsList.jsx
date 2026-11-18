import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/doctors/", { params: { specialty } })
      .then((res) => {
        setDoctors(res.data);
        setError("");
      })
      .catch(() => setError("Could not load doctors. Is Django running?"))
      .finally(() => setLoading(false));
  }, [specialty]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Our Doctors</h2>

      <input
        className="form-control mb-4"
        style={{ maxWidth: 320 }}
        placeholder="Filter by specialty, e.g. Cardiology"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && doctors.length === 0 && <p>No doctors found.</p>}

      <div className="row">
        {doctors.map((d) => (
          <div className="col-md-4 mb-4" key={d.id}>
           <div className="card h-100">
              {d.photo ? (
                <img
                  src={d.photo}
                  alt={`Dr. ${d.first_name} ${d.last_name}`}
                  className="card-img-top"
                  style={{ height: "220px", objectFit: "cover", objectPosition: "top" }}
                />
              ) : (
                <div
                  className="bg-light d-flex align-items-center justify-content-center text-muted"
                  style={{ height: "220px" }}
                >
                  No photo
                </div>
              )}
              <div className="card-body"> 
                <h5 className="card-title">
                  Dr. {d.first_name} {d.last_name}
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">{d.specialty}</h6>
                <p className="card-text">{d.bio}</p>
                <small className="text-muted">
                  {d.years_experience} years of experience
                  <div className="mt-3">
                    <Link
                      to={`/doctors/${d.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View profile & book
                    </Link>
                  </div>
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsList;
