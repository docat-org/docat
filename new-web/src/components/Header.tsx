import { Link } from "react-router-dom";
import styles from "./../style/components/Header.module.css";

export default function Header(): JSX.Element {
  const defaultImg = (
    <img
      className={styles["logo"]}
      alt="docat logo"
      src={require("../assets/logo.png")}
    />
  );
  const defaultTitle = <h1 className={styles["header-title"]}>DOCAT</h1>;

  return (
    <div className={styles["header"]}>
      <Link to="/">
        {defaultImg}
        {defaultTitle}
      </Link>
    </div>
  );
}
