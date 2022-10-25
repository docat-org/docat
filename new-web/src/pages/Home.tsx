import { useEffect, useState } from "react";
import { ErrorOutline } from "@mui/icons-material";

import ProjectRepository from "../repositories/ProjectRepository";
import Project from "../components/Project";
import UploadButton from "../components/UploadButton";
import "./../style/Home.css";
import ClaimButton from "../components/ClaimButton";
import DeleteButton from "../components/DeleteButton";

export default function Home(): JSX.Element {
  const [projects, setProjects] = useState<string[]>([]);
  const [nonFavoriteProjects, setNonFavoriteProjects] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  function updateFavorites(projects: string[]) {
    const favorites = projects.filter((project) =>
      ProjectRepository.isFavorite(project)
    );
    const nonFavorites = projects.filter(
      (project) => !ProjectRepository.isFavorite(project)
    );

    setFavoriteProjects(favorites);
    setNonFavoriteProjects(nonFavorites);
  }

  useEffect(() => {
    setLoading(true);

    ProjectRepository.get().then((projects) => {
      if (!projects) {
        setLoadingFailed(true);

        return;
      }

      setProjects(projects);
      updateFavorites(projects);
      return;
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

  if (projects.length === 0) {
    return <div></div>; //TODO: Add gettingstarted.md
  }

  return (
    <>
      <div className="project-overview">
        {favoriteProjects.length > 0 && (
          <div>
            <div className="project-list">
              {favoriteProjects.map((project) => {
                return (
                  <Project
                    projectName={project}
                    key={project}
                    onFavoriteChanged={() => updateFavorites(projects)}
                  />
                );
              }, [])}
            </div>
            <div className="divider" />
          </div>
        )}
        <div className="project-list">
          {nonFavoriteProjects.map((project) => {
            return (
              <Project
                projectName={project}
                key={project}
                onFavoriteChanged={() => updateFavorites(projects)}
              />
            );
          }, [])}
        </div>
      </div>
      <UploadButton></UploadButton>
      <ClaimButton></ClaimButton>
      <DeleteButton></DeleteButton>
    </>
  );
}
