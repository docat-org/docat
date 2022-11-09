import { useEffect, useState } from "react";
import { ErrorOutline } from "@mui/icons-material";

import ProjectRepository from "../repositories/ProjectRepository";

import Help from "./Help";
import UploadButton from "../components/UploadButton";
import ClaimButton from "../components/ClaimButton";
import DeleteButton from "../components/DeleteButton";
import ProjectList from "../components/ProjectList";
import Header from "../components/Header";
import Footer from "../components/Footer";

import styles from "./../style/pages/Home.module.css";
import LoadingPage from "./LoadingPage";

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
      <div className={styles["loading-error"]}>
        <ErrorOutline color="error" />
        <div>Failed to load Projects</div>
      </div>
    );
  }

  if (loading) {
    return <LoadingPage />;
  }

  if (projects.length === 0) {
    return <Help />;
  }

  return (
    <div className={styles["home"]}>
      <Header />
      <div className={styles["project-overview"]}>
        <ProjectList
          projects={favoriteProjects}
          onFavoriteChanged={() => updateFavorites(projects)}
        />
        <div className={styles["divider"]} />
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
