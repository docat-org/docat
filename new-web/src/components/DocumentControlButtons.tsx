import { Home, VisibilityOff } from "@mui/icons-material";
import { FormControl, MenuItem, Select } from "@mui/material";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import ProjectDetails from "../models/ProjectDetails";

import "./../style/components/DocumentControlButtons.css";

interface Props {
  version: string;
  versions: ProjectDetails[];
  onVersionChange: (version: string) => void;
  onHideUi: () => void;
}

export default function DocumentControlButtons(props: Props): JSX.Element {
  return (
    <div className="controls">
      <ReactTooltip />
      <Link to="/" className="home-button" data-tip="Project Overview">
        <Home sx={{ width: "25px", height: "25px" }} />
      </Link>

      <FormControl>
        <Select
          className="version-select"
          onChange={(e) => props.onVersionChange(e.target.value)}
          value={props.versions.length ? props.version : ""}
        >
          {props.versions.map((v) => (
            <MenuItem key={v.name} value={v.name}>
              {v.name + (v.tags.length ? ` (${v.tags.join(", ")})` : "")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <button
        className="hide-controls-button"
        data-tip="Hide Controls"
        onClick={() => {
          window.history.pushState({}, "", window.location.pathname);
          props.onHideUi();
        }}
      >
        <VisibilityOff sx={{ width: "25px", height: "25px" }} />
      </button>
    </div>
  );
}
