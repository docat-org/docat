import ReactTooltip from "react-tooltip";
import { FileUpload } from "@mui/icons-material";
import { Link } from "react-router-dom";

import "./../style/components/ControlButtons.css";

export default function UploadButton() {
  return (
    <>
      <ReactTooltip />
      <Link to="/upload" data-tip="Upload Documentation">
        <button className="upload-btn">
          <FileUpload></FileUpload>
        </button>
      </Link>
    </>
  );
}
