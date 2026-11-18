
import { Link } from "react-router-dom";
import { FaCalendarCheck, FaUserMd, FaNotesMedical } from "react-icons/fa";

import heroImg from "../../assets/hero1.jpg";
import doctorImg from "../../assets/doctor2.jpg";
import nurseImg from "../../assets/nurse.jpg";
import teamImg from "../../assets/team.jpg";

const features = [
  {
    icon: <FaCalendarCheck size={32} className="text-primary mb-3" />,
    title: "Easy booking",
    text: "Pick a doctor, choose a free time and book in a few clicks.",
  },
  {
    icon: <FaUserMd size={32} className="text-primary mb-3" />,
    title: "Trusted doctors",
    text: "See each doctor's specialty and working hours before you book.",
  },
  {
    icon: <FaNotesMedical size={32} className="text-primary mb-3" />,
    title: "Your health history",
    text: "Read your visit notes any time from your own account.",
  },
];

const team = [
  {
    img: doctorImg,
    title: "Our doctors",
    text: "Experienced specialists who take time to listen.",
  },
  {
    img: nurseImg,
    title: "Our nurses",
    text: "Caring support before and after every visit.",
  },
  {
    img: teamImg,
    title: "One caring team",
    text: "Working together so you feel looked after.",
  },
];

function Home() {
  return (
    <div>
      {/* Banner */}
      <section className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold">Welcome to St Eves</h1>
            <p className="lead">Book appointments with our doctors online.</p>
            <Link to="/login" className="btn btn-primary btn-lg me-2 mb-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-secondary btn-lg mb-2">
              Register
            </Link>
          </div>
          <div className="col-lg-6">
            <img
              src={heroImg}
              alt="Doctor caring for a patient"
              className="img-fluid rounded shadow w-100"
              style={{ maxHeight: 380, objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-4">Why choose St Eves</h2>
          <div className="row g-4">
            {features.map((f) => (
              <div className="col-md-4" key={f.title}>
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="card-body">
                    {f.icon}
                    <h5 className="card-title">{f.title}</h5>
                    <p className="card-text text-muted">{f.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care team */}
      <section className="container py-5">
        <h2 className="text-center mb-4">Meet our care team</h2>
        <div className="row g-4">
          {team.map((t) => (
            <div className="col-md-4" key={t.title}>
              <div className="card h-100 border-0 shadow-sm">
                <img
                  src={t.img}
                  alt={t.title}
                  className="card-img-top"
                  style={{ height: 240, objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{t.title}</h5>
                  <p className="card-text text-muted">{t.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <h2 className="mb-3">Ready to see a doctor?</h2>
          <Link to="/doctors" className="btn btn-light btn-lg">
            Book an appointment
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;