import { Link } from "react-router-dom";
import { Lock } from "@mui/icons-material";
import ReactTooltip from "react-tooltip";

import styles from "./../style/components/ControlButtons.module.css";

export default function ClaimButton() {
  return (
    <>
      <ReactTooltip />
      <Link to="/claim" data-tip="Claim a Project">
        <button className={styles["claim-btn"]}>
          <Lock></Lock>
        </button>
      </Link>
    </>
  );
}
