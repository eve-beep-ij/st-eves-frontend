import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import { downloadPrescriptionPdf } from "../../utils/prescriptionPdf";

const emptyMedicine = { name: "", dose: "", frequency: "", days: "" };

function Prescription() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [note, setNote] = useState(null);
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          const res = await api.get(`/records/appointment/${id}/`);
          setNote(res.data);
          if (res.data.medicines && res.data.medicines.length > 0) {
            setMedicines(res.data.medicines);
          }
        }
      } catch {
        setError("Could not load this appointment.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateMedicine = (index, field, value) => {
    setSuccess("");
    setMedicines(
      medicines.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addMedicine = () => setMedicines([...medicines, { ...emptyMedicine }]);

  const removeMedicine = (index) =>
    setMedicines(medicines.filter((_, i) => i !== index));

  const getFilled = () => medicines.filter((m) => m.name.trim());

  const handleSave = async () => {
    const filled = getFilled();
    if (filled.length === 0) {
      setError("Add at least one medicine with a name.");
      return;
    }
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.patch(`/records/appointment/${id}/`, {
        medicines: filled,
      });
      setNote(res.data);
      setMedicines(
        res.data.medicines.length > 0 ? res.data.medicines : [{ ...emptyMedicine }]
      );
      setSuccess(
        "Prescription saved. The patient can now download it under My Medical History."
      );
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail || data?.medicines?.[0] || "Could not save the prescription."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const filled = getFilled();
    if (filled.length === 0) {
      setError("Add at least one medicine with a name.");
      return;
    }
    setError("");
    downloadPrescriptionPdf({
      id,
      patientName: appointment.patient_name,
      doctorName: appointment.doctor_name,
      date: appointment.date,
      medicines: filled,
      advice: note?.advice,
      followUp: note?.follow_up,
    });
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
        <Link to="/doctor/dashboard">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to={`/doctor/appointments/${id}`}>← Back to visit note</Link>

      <h2 className="mt-3">Prescription</h2>
      <p className="text-muted">
        {appointment.patient_name} · {appointment.date}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {appointment.status !== "completed" && (
        <div className="alert alert-info">
          You can write a prescription after this appointment is marked
          completed.
        </div>
      )}

      {appointment.status === "completed" && !note?.id && (
        <div className="alert alert-info">
          Save the visit note first, then come back to write the prescription.
        </div>
      )}

      {appointment.status === "completed" && note?.id && (
        <>
          {medicines.map((m, index) => (
            <div className="row g-2 mb-3" key={index}>
              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="Medicine, e.g. Amlodipine"
                  value={m.name}
                  onChange={(e) => updateMedicine(index, "name", e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  className="form-control"
                  placeholder="Dose, e.g. 5mg"
                  value={m.dose}
                  onChange={(e) => updateMedicine(index, "dose", e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="How often, e.g. Twice daily"
                  value={m.frequency}
                  onChange={(e) =>
                    updateMedicine(index, "frequency", e.target.value)
                  }
                />
              </div>
              <div className="col-md-2">
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="Days"
                  value={m.days}
                  onChange={(e) => updateMedicine(index, "days", e.target.value)}
                />
              </div>
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeMedicine(index)}
                  disabled={medicines.length === 1}
                  aria-label="Remove medicine"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline-primary me-2 mb-2"
            onClick={addMedicine}
          >
            + Add medicine
          </button>
          <button
            type="button"
            className="btn btn-primary me-2 mb-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save prescription"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary mb-2"
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}

export default Prescription;