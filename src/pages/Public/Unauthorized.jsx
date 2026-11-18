import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">Access Denied</h1>
      <p className="lead">You don't have permission to view this page.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

export default Unauthorized;
