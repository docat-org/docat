import Project from "./Project";

import styles from "./../style/components/ProjectList.module.css";

export default function ProjectList(props: {
  projects: string[];
  onFavoriteChanged: () => void;
}) {
  if (!props.projects) {
    return <></>;
  }

  return (
    <div className={styles["project-list"]}>
      {props.projects.map((project) => (
        <Project
          projectName={project}
          key={project}
          onFavoriteChanged={() => props.onFavoriteChanged()}
        />
      ))}
    </div>
  );
}
