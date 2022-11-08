import { Link } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import ReactTooltip from "react-tooltip";

import styles from "./../style/components/ControlButtons.module.css";

export default function DeleteButton() {
  return (
    <>
      <ReactTooltip />
      <Link to="/delete" data-tip="Delete a Documentation Version">
        <button className={styles["delete-btn"]}>
          <Delete></Delete>
        </button>
      </Link>
    </>
  );
}
