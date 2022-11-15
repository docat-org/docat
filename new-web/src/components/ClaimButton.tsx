import { Link } from "react-router-dom";
import { Lock } from "@mui/icons-material";
import ReactTooltip from "react-tooltip";

import styles from "./../style/components/ControlButtons.module.css";

interface ButtonProps {
  isSingleButton?: boolean;
}

export default function ClaimButton(props: ButtonProps): JSX.Element {
  return (
    <>
      <ReactTooltip />
      <Link to="/claim" data-tip="Claim a Project">
        <button
          className={
            props.isSingleButton
              ? styles["single-control-button"]
              : styles["claim-button"]
          }
        >
          <Lock></Lock>
        </button>
      </Link>
    </>
  );
}
