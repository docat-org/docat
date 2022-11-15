import { TextField } from "@mui/material";
import { useState } from "react";
import DataSelect from "../components/DataSelect";
import PageLayout from "../components/PageLayout";
import StyledForm from "../components/StyledForm";
import ProjectRepository from "../repositories/ProjectRepository";
import LoadingPage from "./LoadingPage";

export default function Claim(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
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

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await ProjectRepository.claim(project);
      setToken(response.token);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingPage />;
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
          dataSource={ProjectRepository.get()}
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
