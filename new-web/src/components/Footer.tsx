import { Link } from "react-router-dom";
import "./../style/components/Footer.css";

export default function Footer(): JSX.Element {
  return (
    <div className="footer">
      <Link to="/help" className="help-link">
        Help
      </Link>
    </div>
  );
}
