import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectRepository from "../repositories/ProjectRepository";
import "./../style/Project.css";

import { Star, StarOutline } from "@mui/icons-material";
import ProjectDetails from "../models/ProjectDetails";
import ReactTooltip from "react-tooltip";

export default function Project(props: { projectName: string, onFavoriteChanged: () => void }): JSX.Element {
  const logoURL = ProjectRepository.getProjectLogoURL(props.projectName);

  const [isFavorite, setIsFavorite] = useState<boolean>(
    ProjectRepository.isFavorite(props.projectName)
  );
  const [versions, setVersions] = useState<ProjectDetails[]>([]);
  const [latestVersion, setLatestVersion] = useState<string>("");

  //required, as otherwise the image would flash
  const [logoExists, setLogoExists] = useState<boolean | null>(null);

  function toggleFavorite() {
    const newIsFavorite = !isFavorite;
    ProjectRepository.setFavorite(props.projectName, newIsFavorite);
    setIsFavorite(newIsFavorite);

    props.onFavoriteChanged();
  }

  useEffect(() => {
    fetch(logoURL).then((res) => setLogoExists(res.ok));

    ProjectRepository.getVersions(props.projectName).then((versions) => {
      if (!versions) {
        return;
      }

      setVersions(versions);
      setLatestVersion(versions[0].name);
    });
  }, [props.projectName, logoURL]);

  if (isFavorite) {
    var star = (
      <Star
        className="star"
        style={{ color: "#505050" }}
        onClick={toggleFavorite}
      />
    );
  } else {
    star = (
      <StarOutline
        className="star"
        style={{ color: "#505050" }}
        onClick={toggleFavorite}
      />
    );
  }

  return (
    <div className="project-card">
      <ReactTooltip />
      <div className="project-card-header">
        <Link to={`/${props.projectName}/${latestVersion}`}>
          {logoExists === true && (
            <img
              className="project-logo"
              src={logoURL}
              alt={`${props.projectName} project Logo`}
            />
          )}

          <div
            className={
              logoExists === true
                ? "project-card-title-with-logo"
                : "project-card-title"
            }
            data-tip={props.projectName}
          >
            {props.projectName}
          </div>
        </Link>
        {star}
      </div>
      <div className="subhead">
        {versions.length} {versions.length === 1 ? " Version" : " Versions"}
      </div>
    </div>
  );
}
