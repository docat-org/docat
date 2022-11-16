import { TextField } from "@mui/material";
import { useCallback, useState } from "react";
import DataSelect from "../components/DataSelect";
import PageLayout from "../components/PageLayout";
import StyledForm from "../components/StyledForm";
import ProjectRepository from "../repositories/ProjectRepository";

export default function Claim(): JSX.Element {
  const [projectMissing, setProjectMissing] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [project, setProject] = useState<string>("none");
  const [token, setToken] = useState<string>("");

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

  const getProjects = useCallback(async (): Promise<string[]> => {
    if (errorMsg) return []; // Failed to load, prevent loading again

    try {
      const projects = await ProjectRepository.get();
      return projects;
    } catch (e: any) {
      setErrorMsg("Failed to load projects");
      setTimeout(() => setErrorMsg(""), 5000); // Reset, so we can try loading again after 5 seconds
      return [];
    }
  }, [errorMsg]);

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
          dataSource={getProjects()}
          onChange={(p) => {
            if (p === "none" || !p) {
              setProjectMissing(true);
            } else {
              setProjectMissing(false);
            }

            setProject(p);
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

        <button type="submit" onClick={claim}>
          Claim
        </button>
      </StyledForm>
    </PageLayout>
  );
}
