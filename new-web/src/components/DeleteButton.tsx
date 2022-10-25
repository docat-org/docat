import { Link } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import ReactTooltip from "react-tooltip";

export default function DeleteButton() {
  return (
    <>
      <ReactTooltip />
      <Link to="/delete" data-tip="Delete a Documentation Version">
        <button className="delete-btn">
          <Delete></Delete>
        </button>
      </Link>
    </>
  );
}
