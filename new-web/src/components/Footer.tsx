import { BrowserRouter, Link } from "react-router-dom";
import './../style/Footer.css';

export default function Footer(): JSX.Element {
    return (
        <div className="footer">
            <BrowserRouter>
                <Link to="/help" className="help-link">Help</Link>
            </BrowserRouter>
        </div>
    )
}