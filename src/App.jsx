import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DoctorsList from "./pages/Public/DoctorsList";
import DoctorDetail from "./pages/Public/DoctorDetail";
import MyAppointments from "./pages/Patient/MyAppointments";

import Home from "./pages/Public/Home";
import Login from "./pages/Public/Login";
import Register from "./pages/Public/Register";
import NotFound from "./pages/Public/NotFound";
import Unauthorized from "./pages/Public/Unauthorized";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import ManageSchedule from "./pages/Doctor/ManageSchedule";
import RescheduleAppointment from "./pages/Patient/RescheduleAppointment";
import MedicalHistory from "./pages/Patient/MedicalHistory";
import AppointmentDetails from "./pages/Doctor/AppointmentDetails";
import AppointmentsCalendar from "./components/AppointmentsCalendar";
import Prescription from "./pages/Extras/Prescription";
import Telemedicine from "./pages/Extras/Telemedicine";
import MyProfile from "./pages/Patient/MyProfile";
import MyPatients from "./pages/Doctor/MyPatients";
import PatientDetails from "./pages/Doctor/PatientDetails";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute roles={["patient"]}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments/:id/reschedule"
            element={
              <ProtectedRoute roles={["patient"]}>
                <RescheduleAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute roles={["patient"]}>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute roles={["doctor", "staff"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute roles={["doctor", "staff"]}>
                <ManageSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <MyPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute roles={["patient"]}>
                <MedicalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments/:id"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <AppointmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute roles={["patient", "doctor", "staff"]}>
                <AppointmentsCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments/:id/prescription"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Prescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id/call"
            element={
              <ProtectedRoute roles={["patient", "doctor"]}>
                <Telemedicine />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;