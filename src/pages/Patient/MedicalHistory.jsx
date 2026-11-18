import { useEffect, useState } from "react";
import api from "../../api";
import { downloadPrescriptionPdf } from "../../utils/prescriptionPdf";

function MedicalHistory() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/records/")
      .then((res) => setNotes(res.data))
      .catch(() => setError("Could not load your history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <h2>My Medical History</h2>
      <p className="text-muted">
        Notes your doctor wrote after each completed visit.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && !error && notes.length === 0 && (
        <p className="text-muted">You have no visit notes yet.</p>
      )}

      {notes.map((n) => (
        <div className="card mb-3" key={n.id}>
          <div className="card-header d-flex justify-content-between">
            <strong>
              {n.date} at {n.start_time.slice(0, 5)}
            </strong>
            <span className="text-muted">{n.doctor_name}</span>
          </div>
          <div className="card-body">
            <h6>Summary</h6>
            <p style={{ whiteSpace: "pre-wrap" }}>{n.summary}</p>

            {n.advice && (
              <>
                <h6>Advice</h6>
                <p style={{ whiteSpace: "pre-wrap" }}>{n.advice}</p>
              </>
            )}

            {n.follow_up && (
              <>
                <h6>Follow-up</h6>
                <p className="mb-0">{n.follow_up}</p>
              </>
            )}
             {n.medicines && n.medicines.length > 0 && (
              <>
                <h6 className="mt-3">Prescription</h6>
                <ul>
                  {n.medicines.map((m, i) => (
                    <li key={i}>
                      <strong>{m.name}</strong>
                      {m.dose ? ` - ${m.dose}` : ""}
                      {m.frequency || m.days
                        ? ` · ${[m.frequency, m.days ? `for ${m.days} days` : ""]
                            .filter(Boolean)
                            .join(" ")}`
                        : ""}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    downloadPrescriptionPdf({
                      id: n.appointment,
                      patientName: n.patient_name,
                      doctorName: n.doctor_name,
                      date: n.date,
                      medicines: n.medicines,
                      advice: n.advice,
                      followUp: n.follow_up,
                    })
                  }
                >
                  Download prescription (PDF)
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MedicalHistory;