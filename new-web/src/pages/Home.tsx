import { useState } from "react";

import ProjectRepository from "../repositories/ProjectRepository";
import { useProjects } from "../data-providers/ProjectDataProvider";

import Help from "./Help";
import UploadButton from "../components/UploadButton";
import ClaimButton from "../components/ClaimButton";
import DeleteButton from "../components/DeleteButton";
import ProjectList from "../components/ProjectList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingPage from "./LoadingPage";

import styles from "./../style/pages/Home.module.css";
import { ErrorOutline } from "@mui/icons-material";

export default function Home(): JSX.Element {
  const { projects, loadingFailed } = useProjects();
  const [nonFavoriteProjects, setNonFavoriteProjects] = useState<string[]>([]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);

  document.title = "Home | docat";

  function updateFavorites() {
    if (!projects) return;

    const favorites = projects.filter((project) =>
      ProjectRepository.isFavorite(project)
    );
    const nonFavorites = projects.filter(
      (project) => !ProjectRepository.isFavorite(project)
    );

    setFavoriteProjects(favorites);
    setNonFavoriteProjects(nonFavorites);
  }

  if (loadingFailed) {
    return (
      <div className={styles["home"]}>
        <Header />
        <div className={styles["loading-error"]}>
          <ErrorOutline color="error" />
          <div>Failed to load projects</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!projects) {
    return <LoadingPage />;
  }

  if (projects.length === 0) {
    return <Help />;
  }

  // update favorites when they aren't loaded yet
  if (projects && !favoriteProjects.length && !nonFavoriteProjects.length) {
    updateFavorites();
  }

  return (
    <div className={styles["home"]}>
      <Header />
      <div className={styles["project-overview"]}>
        <ProjectList
          projects={favoriteProjects}
          onFavoriteChanged={() => updateFavorites()}
        />
        <div className={styles["divider"]} />
        <ProjectList
          projects={nonFavoriteProjects}
          onFavoriteChanged={() => updateFavorites()}
        />
      </div>
      <UploadButton></UploadButton>
      <ClaimButton></ClaimButton>
      <DeleteButton></DeleteButton>
      <Footer />
    </div>
  );
}
