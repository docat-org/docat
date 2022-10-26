import { Link } from "react-router-dom";
import "./../style/Header.css";

export default function Header(): JSX.Element {
  const defaultImg = (
    <img
      className="logo"
      alt="docat logo"
      src={require("../assets/logo.png")}
    />
  );
  const defaultTitle = <h1 className="header-title">DOCAT</h1>;

  return (
    <div className="header">
      <Link to="/">
        {defaultImg}
        {defaultTitle}
      </Link>
    </div>
  );
}
