import { TextField } from "@mui/material";
import { useState } from "react";
import DataSelect from "../components/DataSelect";
import ProjectRepository from "../repositories/ProjectRepository";
import StyledForm from "../components/StyledForm";
import PageLayout from "../components/PageLayout";
import LoadingPage from "./LoadingPage";

export default function Claim(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteSuccessful, setDeleteSuccessful] = useState<boolean | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [project, setProject] = useState<string>("none");
  const [version, setVersion] = useState<string>("none");
  const [token, setToken] = useState<string>("");

  async function deleteDocumentation(): Promise<void> {
    if (!project || project === "none") return;
    if (!version || version === "none") return;
    if (!token) return;

    try {
      setLoading(true);

      await ProjectRepository.deleteDoc(project, version, token);

      setDeleteSuccessful(true);
      setErrorMsg("");
    } catch (e: any) {
      console.error(e);

      setErrorMsg(e.message);
      setDeleteSuccessful(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <PageLayout
      title="Delete Documentation"
      successMsg={deleteSuccessful ? "Documentation deleted successfully" : ""}
      errorMsg={errorMsg}
    >
      <StyledForm>
        <DataSelect
          emptyMessage="Please select a Project"
          label="Project"
          dataSource={ProjectRepository.get()}
          onChange={(project) => setProject(project)}
        />

        <DataSelect
          emptyMessage="Please select a Version"
          label="Version"
          dataSource={
            project === "none"
              ? Promise.resolve([])
              : ProjectRepository.getVersions(project).then((versions) =>
                  versions.map((v) => v.name)
                )
          }
          onChange={(version) => setVersion(version)}
        />

        <TextField
          fullWidth
          label="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        >
          {token}
        </TextField>

        <button type="submit" onClick={deleteDocumentation}>
          Delete
        </button>
      </StyledForm>
    </PageLayout>
  );
}
