import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Today's date as YYYY-MM-DD, in the visitor's own time zone
  const today = new Date().toLocaleDateString("en-CA");

  // Load the doctor once
  useEffect(() => {
    api
      .get(`/doctors/${id}/`)
      .then((res) => setDoctor(res.data))
      .catch(() => setMessage({ type: "danger", text: "Doctor not found." }));
  }, [id]);

  // Load free slots whenever the date changes (or after a booking)
  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    api
      .get("/appointments/slots/", { params: { doctor: id, date } })
      .then((res) => setSlots(res.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, date, refreshKey]);

  const handleBook = async () => {
    setMessage({ type: "", text: "" });
    try {
      await api.post("/appointments/", {
        doctor: Number(id),
        date,
        start_time: selected,
        reason,
      });
      setMessage({
        type: "success",
        text: "Appointment booked! You can see it under My appointments.",
      });
      setSelected("");
      setReason("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const data = err.response?.data;
      const text =
        data?.non_field_errors?.[0] ||
        data?.detail ||
        "Could not book this appointment. Please try again.";
      setMessage({ type: "danger", text });
    }
  };

  if (!doctor) {
    return (
      <div className="container mt-4">
        {message.text ? (
          <div className="alert alert-danger">{message.text}</div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to="/doctors">← All doctors</Link>

        {doctor.photo && (
          <div className="mb-3">
          <img
            src={doctor.photo}
            alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
            className="rounded"
            style={{ width: "220px", height: "220px", objectFit: "cover", objectPosition: "top" }}
          />
          </div>
        )}
      <h2 className="mt-3">
        Dr. {doctor.first_name} {doctor.last_name}
      </h2>
      <h5 className="text-muted">{doctor.specialty}</h5>
      <p>{doctor.bio}</p>
      <p className="text-muted">
        {doctor.years_experience} years of experience
      </p>

      <h5 className="mt-4">Working hours</h5>
      <ul>
        {doctor.schedules.map((s) => (
          <li key={s.id}>
            {s.weekday_name}: {s.start_time.slice(0, 5)} to{" "}
            {s.end_time.slice(0, 5)}
          </li>
        ))}
      </ul>

      <hr />
      <h4>Book an appointment</h4>

      {!user && (
        <div className="alert alert-info">
          Please <Link to="/login">log in</Link> or{" "}
          <Link to="/register">register</Link> to book.
        </div>
      )}

      {user && user.role !== "patient" && (
        <div className="alert alert-info">
          Only patients can book appointments.
        </div>
      )}

      {user && user.role === "patient" && (
        <>
          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <label className="form-label">Choose a date</label>
          <input
            type="date"
            className="form-control mb-3"
            style={{ maxWidth: 220 }}
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelected("");
              setMessage({ type: "", text: "" });
            }}
          />

          {date && loadingSlots && <p>Loading times...</p>}

          {date && !loadingSlots && slots.length === 0 && (
            <p className="text-muted">
              No free times on this day. Try another date within the working
              hours above.
            </p>
          )}

          <div className="mb-3">
            {slots.map((slot) => (
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
            <>
              <input
                className="form-control mb-3"
                placeholder="Reason for visit (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button className="btn btn-success" onClick={handleBook}>
                Book {date} at {selected}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default DoctorDetail;
