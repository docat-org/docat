import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./../style/pages/NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles["not-found"]}>
      <Header />
      <div className={styles["not-found-container"]}>
        <h1 className={styles["not-found-title"]}>404 - Not Found</h1>
        <p className={styles["not-found-text"]}>
          Sorry, the page you were looking for was not found.
        </p>
        <Link to="/" className={styles["not-found-link"]}>
          Home
        </Link>
      </div>
      <Footer />
    </div>
  );
}
