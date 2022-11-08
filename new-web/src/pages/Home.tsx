import { useEffect, useState } from "react";
import { ErrorOutline } from "@mui/icons-material";

import ProjectRepository from "../repositories/ProjectRepository";

import UploadButton from "../components/UploadButton";
import ClaimButton from "../components/ClaimButton";
import DeleteButton from "../components/DeleteButton";

import "./../style/Home.css";
import ProjectList from "../components/ProjectList";
import Help from "./Help";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home(): JSX.Element {
  const [projects, setProjects] = useState<string[]>([]);
  const [nonFavoriteProjects, setNonFavoriteProjects] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  document.title = "Home | docat";

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
    ProjectRepository.get().then((projects) => {
      if (!projects) {
        setLoadingFailed(true);
        return;
      }

      setProjects(projects);
      updateFavorites(projects);
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
    return <Help />;
  }

  return (
    <div className="home">
      <Header />
      <div className="project-overview">
        <ProjectList
          projects={favoriteProjects}
          onFavoriteChanged={() => updateFavorites(projects)}
        />
        <div className="divider" />
        <ProjectList
          projects={nonFavoriteProjects}
          onFavoriteChanged={() => updateFavorites(projects)}
        />
      </div>
      <UploadButton></UploadButton>
      <ClaimButton></ClaimButton>
      <DeleteButton></DeleteButton>
      <Footer />
    </div>
  );
}
