import { Home, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import ProjectDetails from "../models/ProjectDetails";
import ProjectRepository from "../repositories/ProjectRepository";

import "./../style/Docs.css";

export default function Docs(): JSX.Element {
  const iFrameRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const updateRoute = useCallback(
    (
      project: string,
      version: string,
      page: string,
      hideControls: boolean
    ): void => {
      window.history.replaceState(
        {},
        "",
        `/${project}/${version}/${page}${hideControls ? "?hide-ui=true" : ""}`
      );
    },
    []
  );

  const proj = useParams().project || "";
  const ver = useParams().version || "latest";
  const location = useParams().page || "index.html";
  const hideControls = useSearchParams()[0].get("hide-ui") === "true";

  const [project] = useState<string>(proj);
  const [version, setVersion] = useState<string>(ver);
  const [page, setPage] = useState<string>(location);
  const [hideUi, setHideUi] = useState<boolean>(hideControls);
  const [versions, setVersions] = useState<ProjectDetails[]>([]);

  updateRoute(project, version, page, hideUi);

  document.title = `${project} | docat`;

  useEffect(() => {
    if (!project) {
      setErrorMessage("Project not found");
      return;
    }

    ProjectRepository.getVersions(project).then((allVersions) => {
      if (!allVersions) {
        setErrorMessage("Project not found");
        return;
      }

      if (version === "latest") {
        const latestVersion = allVersions[0].name;
        setVersion(latestVersion);
        updateRoute(project, latestVersion, page, hideUi);
        return;
      }

      setVersions(
        allVersions.sort((a, b) => ProjectRepository.compareVersions(a, b))
      );

      const versionsAndTags = allVersions
        .map((v) => [v.name, ...v.tags])
        .flat();

      if (!versionsAndTags.includes(version)) {
        setErrorMessage("Version not found");
        return;
      }
    });
  }, [project, version, page, hideUi, updateRoute]);

  if (errorMessage) {
    return <div className="error-banner">{errorMessage}</div>;
  }

  function handleVersionChange(e: SelectChangeEvent<string>): void {
    setVersion(e.target.value);
    updateRoute(project, e.target.value, page, hideUi);
  }

  function onChange(): void {
    if (!iFrameRef.current) return;

    // update the path in the url
    // @ts-ignore
    const path: string = iFrameRef.current.contentWindow?.location.href;
    const page = path.split(`${version}/`)[1];

    if (!page) return;

    setPage(page);
    updateRoute(project, version, page, hideUi);

    // make all links in iframe open in new tab
    // @ts-ignore
    iFrameRef.current.contentDocument
      .querySelectorAll("a")
      .forEach((a: HTMLAnchorElement) => {
        if (!a.href.startsWith(window.location.origin)) {
          // open all foreign links in a new tab
          a.setAttribute("target", "_blank");
        }
      });
  }

  const url = ProjectRepository.getProjectDocsURL(project, version, page);

  return (
    <>
      <iframe
        title="docs"
        ref={iFrameRef}
        src={url}
        onLoad={onChange}
        className="docs-iframe"
      ></iframe>

      {hideUi || (
        <div className="controls">
          <ReactTooltip />
          <Link to="/" className="home-button" data-tip="Project Overview">
            <Home sx={{ width: "25px", height: "25px" }} />
          </Link>

          <FormControl>
            <Select
              className="version-select"
              onChange={handleVersionChange}
              value={versions.length ? version : ""}
            >
              {versions.map((v) => (
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
              updateRoute(project, version, page, true);
              setHideUi(true);
            }}
          >
            <VisibilityOff sx={{ width: "25px", height: "25px" }} />
          </button>
        </div>
      )}
    </>
  );
}
