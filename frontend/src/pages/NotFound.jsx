import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link to="/">
        <button>Go Home</button>
      </Link>
    </div>
  );
};

export default NotFound;
