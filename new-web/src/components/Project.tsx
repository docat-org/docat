import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/components/Project.module.css";

import ProjectDetails from "../models/ProjectDetails";
import ReactTooltip from "react-tooltip";
import FavoriteStar from "./FavoriteStar";

export default function Project(props: {
  projectName: string;
  onFavoriteChanged: () => void;
}): JSX.Element {
  const [versions, setVersions] = useState<ProjectDetails[]>([]);
  //required, as otherwise the image would flash
  const [logoExists, setLogoExists] = useState<boolean | null>(null);

  const logoURL = ProjectRepository.getProjectLogoURL(props.projectName);

  useEffect(() => {
    fetch(logoURL).then((res) => setLogoExists(res.ok));

    ProjectRepository.getVersions(props.projectName).then((versions) => {
      if (!versions) {
        return;
      }

      setVersions(versions);
    });
  }, [props.projectName, logoURL]);

  const versionsSubhead =
    versions.length === 1
      ? `${versions.length} version`
      : `${versions.length} versions`;

  return (
    <div className={styles["project-card"]}>
      <ReactTooltip />
      <div className={styles["project-card-header"]}>
        <Link to={`/${props.projectName}/latest`}>
          {logoExists === true && (
            <>
              <img
                className={styles["project-logo"]}
                src={logoURL}
                alt={`${props.projectName} project Logo`}
              />

              <div
                className={styles["project-card-title-with-logo"]}
                data-tip={props.projectName}
              >
                {props.projectName}
              </div>
            </>
          )}
          {logoExists !== true && (
            <div
              className={styles["project-card-title"]}
              data-tip={props.projectName}
            >
              {props.projectName}
            </div>
          )}
        </Link>
        <FavoriteStar
          projectName={props.projectName}
          onFavoriteChanged={props.onFavoriteChanged}
        />
      </div>
      <div className={styles["subhead"]}>{versionsSubhead}</div>
    </div>
  );
}
