import { Link } from "react-router-dom";
import { Lock } from "@mui/icons-material";
import ReactTooltip from "react-tooltip";

export default function ClaimButton() {
  return (
    <>
      <ReactTooltip />
      <Link to="/claim" data-tip="Claim a Project">
        <button className="claim-btn">
          <Lock></Lock>
        </button>
      </Link>
    </>
  );
}
