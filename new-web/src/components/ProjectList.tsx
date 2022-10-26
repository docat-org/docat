import Project from "./Project";

import "./../style/ProjectList.css";

export default function ProjectList(props: {
  projects: string[];
  onFavoriteChanged: () => void;
}) {
  if (!props.projects) {
    return <></>;
  }

  return (
    <div className="project-list">
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
