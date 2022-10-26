import { Link } from "react-router-dom";
import "./../style/NotFound.css"

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404 - Not Found</h1>
      <p className="not-found-text" >Sorry, the page you were looking for was not found.</p>
      <Link to="/" className="not-found-link">Home</Link>
    </div>
  );
}