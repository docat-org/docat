import { createContext, useContext, useEffect, useState } from "react";

interface ProjectState {
  projects: string[] | null;
  loadingFailed: boolean;
}

const Context = createContext<ProjectState>({} as ProjectState);

export function ProjectDataProvider({ children }: any) {
  const [projects, setProjects] = useState<ProjectState>({} as ProjectState);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to load projects, status code: " + res.status);
          return { projects: null };
        }

        return res.json();
      })
      .then((data) => {
        if (data.projects) {
          setProjects({ projects: data.projects, loadingFailed: false });
        } else {
          setProjects({ projects: null, loadingFailed: true });
        }
      });
  }, []);

  return <Context.Provider value={projects}>{children}</Context.Provider>;
}

export const useProjects = () => useContext(Context);
