import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const colors = {
  pending: "#ffc107",
  confirmed: "#198754",
  completed: "#0dcaf0",
};

function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Notice when the screen is a phone size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api
      .get("/appointments/")
      .then((res) => setAppointments(res.data))
      .catch(() => setError("Could not load the calendar."));
  }, []);

  const events = appointments
    .filter((a) => a.status !== "cancelled")
    .map((a) => ({
      id: String(a.id),
      title: user?.role === "patient" ? a.doctor_name : a.patient_name,
      start: `${a.date}T${a.start_time}`,
      color: colors[a.status],
      textColor: a.status === "pending" ? "#212529" : "#ffffff",
    }));

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Calendar</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <FullCalendar
        key={isMobile ? "mobile" : "desktop"}
        plugins={[themePlugin, dayGridPlugin, timeGridPlugin]}
        initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
        headerToolbar={
          isMobile
            ? { left: "prev,next", center: "title", right: "today" }
            : {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }
        }
        footerToolbar={
          isMobile
            ? { center: "dayGridMonth,timeGridWeek,timeGridDay" }
            : false
        }
        navLinks
        allDaySlot={false}
        eventMinHeight={45}
        events={events}
        height="auto"
      />
    </div>
  );
}

export default AppointmentCalendar;