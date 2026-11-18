import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function Telemedicine() {
  const { id } = useParams();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/appointments/")
      .then((res) => {
        const found = res.data.find((a) => String(a.id) === id);
        if (found) setAppointment(found);
        else setError("Appointment not found.");
      })
      .catch(() => setError("Could not load this appointment."))
      .finally(() => setLoading(false));
  }, [id]);

  const backPath =
    user?.role === "doctor" ? "/doctor/dashboard" : "/patient/appointments";

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
        <Link to={backPath}>← Back</Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const roomName = appointment.video_room;
  const isConfirmed = appointment.status === "confirmed";
  const isToday = appointment.date === today;
  const canJoin = isConfirmed && isToday && Boolean(roomName);

  const displayName =
    user?.role === "doctor" ? appointment.doctor_name : appointment.patient_name;
  const callUrl = `https://meet.jit.si/${roomName}#userInfo.displayName=${encodeURIComponent(
    JSON.stringify(displayName)
  )}`;
  
  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <Link to={backPath}>← Back</Link>

      <h2 className="mt-3">Video consultation</h2>
      <p className="text-muted">
        {appointment.doctor_name} with {appointment.patient_name} ·{" "}
        {appointment.date} at {appointment.start_time.slice(0, 5)}
      </p>

      {!isConfirmed && (
        <div className="alert alert-info">
          The video call opens once the doctor has confirmed this appointment.
        </div>
      )}

      {isConfirmed && !isToday && (
        <div className="alert alert-info">
          The video call opens on the day of the appointment (
          {appointment.date}).
        </div>
      )}

      {isConfirmed && isToday && !roomName && (
        <div className="alert alert-warning">
          The video room for this appointment is not ready yet.
        </div>
      )}
      {canJoin && (
        <>
          <a
            className="btn btn-success btn-lg"
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join video call
          </a>
            <p className="text-muted mt-3">
            The call opens in a new tab. Allow your camera and microphone when
            the browser asks. The doctor starts the call, so if you see
            "waiting for a moderator", please wait a moment and you will be let
            in automatically.
          </p>
        </>
      )}

      <p className="text-muted small mt-4">
        Demo note: this uses the free public Jitsi server. A real clinic would
        use a private, secured video server.
      </p>
    </div>
  );
}

export default Telemedicine;