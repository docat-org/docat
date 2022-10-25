import { useEffect, useState } from "react";
import ProjectRepository from "../repositories/ProjectRepository";
import "./../style/Home.css";

import { ErrorOutline } from "@material-ui/icons/";
import Project from "../components/Project";

export default function Home(): JSX.Element {
  const [projects, setProjects] = useState<string[]>([]);
  const [nonFavoriteProjects, setNonFavoriteProjects] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    ProjectRepository.get().then((projects) => {
      if (!projects) {
        setLoadingFailed(true);

        return;
      }

      setProjects(projects);

      const nonFavorites = projects.filter(
        (p) => !ProjectRepository.isFavorite(p)
      );
      const favorites = projects.filter((p) => ProjectRepository.isFavorite(p));

      setNonFavoriteProjects(nonFavorites);
      setFavoriteProjects(favorites);
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
    <div className="project-overview">
      {favoriteProjects.length > 0 && (
        <div>
          <div className="project-list">
            {favoriteProjects.map((project) => {
              return <Project projectName={project} key={project} />;
            }, [])}
          </div>
          <div className="divider" />
        </div>
      )}
      <div className="project-list">
        {nonFavoriteProjects.map((project) => {
          return <Project projectName={project} key={project} />;
        }, [])}
      </div>
    </div>
  );
}
