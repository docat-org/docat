import { TextField } from "@mui/material";
import { useState } from "react";
import DataSelect from "../components/DataSelect";
import PageLayout from "../components/PageLayout";
import StyledForm from "../components/StyledForm";
import { useProjects } from "../data-providers/ProjectDataProvider";
import ProjectRepository from "../repositories/ProjectRepository";

export default function Claim(): JSX.Element {
  const { projects, loadingFailed } = useProjects();

  const [project, setProject] = useState<string>("none");
  const [token, setToken] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [projectMissing, setProjectMissing] = useState<boolean | null>(null);

  document.title = "Claim Token | docat";

  async function claim(): Promise<void> {
    if (!project || project === "none") {
      setProjectMissing(true);
      return;
    }

    try {
      setErrorMsg("");
      const response = await ProjectRepository.claim(project);
      setToken(response.token);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    }
  }

  function getProjects(): string[] {
    if (loadingFailed || !projects) {
      return [];
    }

    return projects;
  }

  if (loadingFailed && errorMsg !== "Failed to load projects") {
    setErrorMsg("Failed to load projects");
  }

  return (
    <PageLayout
      errorMsg={errorMsg}
      title="Claim Token"
      description="Please make sure to store this token safely, as only one token can be generated per project and you will not be able to claim it again."
    >
      <StyledForm>
        <DataSelect
          emptyMessage="Please select a Project"
          label="Project"
          values={getProjects()}
          onChange={(p) => {
            if (p === "none" || !p) {
              setProjectMissing(true);
            } else {
              setProjectMissing(false);
            }

            setProject(p);
            setToken("");
            setErrorMsg("");
          }}
          value={project || "none"}
          errorMsg={projectMissing ? "Please select a Project" : undefined}
        />

        {(token && (
          <TextField
            fullWidth
            label="Token"
            inputProps={{
              readOnly: true,
            }}
            value={token}
          >
            {token}
          </TextField>
        )) || <></>}

        <button type="submit" disabled={!!token} onClick={claim}>
          Claim
        </button>
      </StyledForm>
    </PageLayout>
  );
}
