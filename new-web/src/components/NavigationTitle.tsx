import { ArrowBackIos } from "@mui/icons-material";
import { Link } from "react-router-dom";

import styles from "./../style/components/NavigationTitle.module.css";

interface Props {
  title: string;
  backLink?: string;
  descriptionText?: string;
  descriptionElement?: JSX.Element;
}

export default function NavigationTitle(props: Props): JSX.Element {
  return (
    <>
      <div className={styles["page-header"]}>
        <Link to={props.backLink || "/"} className={styles["back-link"]}>
          <ArrowBackIos />
        </Link>
        <h1 className={styles["page-title"]}>Delete Documentation</h1>
      </div>

      {props.descriptionText && (
        <p className={styles["page-description"]}>{props.descriptionText}</p>
      )}
      {props.descriptionElement && (
        <p className={styles["page-description"]}>{props.descriptionElement}</p>
      )}
    </>
  );
}
