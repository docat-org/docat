import { useEffect, useState } from "react";
import ProjectRepository from "../repositories/ProjectRepository";
import "./../style/Home.css";

import { ErrorOutline } from "@material-ui/icons/";

export default function Home(): JSX.Element {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    ProjectRepository.get().then((projects) => {
      if (projects) {
        setProjects(projects);
      } else {
        setLoadingFailed(true);
      }
    });

    setLoading(false);
  }, []);

  if (loadingFailed) {
    return (
      <div className="loading-error">
        <ErrorOutline color="error" />
        <div>Failed to load Projects</div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="project-overview">
      {projects.map((project) => {
        return (
          <div className="project">
          </div>
        );
      }, [])}
    </div>
  );
}
