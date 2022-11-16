import { TextField } from "@mui/material";
import { useState } from "react";
import DataSelect from "../components/DataSelect";
import ProjectRepository from "../repositories/ProjectRepository";
import StyledForm from "../components/StyledForm";
import PageLayout from "../components/PageLayout";

export default function Claim(): JSX.Element {
  interface Validation {
    projectMissing?: boolean;
    versionMissing?: boolean;
    tokenMissing?: boolean;
  }

  const [deleteSuccessful, setDeleteSuccessful] = useState<boolean | null>(
    null
  );
  const [validation, setValidation] = useState<Validation>({});
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [project, setProject] = useState<string>("none");
  const [version, setVersion] = useState<string>("none");
  const [token, setToken] = useState<string>("");

  function validate(field: "project" | "version" | "token", value: string) {
    const valid = value !== "none" && !!value;
    setValidation({ ...validation, [`${field}Missing`]: !valid });
    return valid;
  }

  async function deleteDocumentation(): Promise<void> {
    if (
      !validate("project", project) ||
      !validate("version", version) ||
      !validate("token", token)
    ) {
      return;
    }

    try {
      await ProjectRepository.deleteDoc(project, version, token);

      setDeleteSuccessful(true);
      setErrorMsg("");
    } catch (e: any) {
      console.error(e);

      setErrorMsg(e.message);
      setDeleteSuccessful(false);
    }
  }

  async function getProjects(): Promise<string[]> {
    if (errorMsg) return []; // Failed to load, prevent loading again

    try {
      const projects = await ProjectRepository.get();
      return projects;
    } catch (e: any) {
      setErrorMsg("Failed to load projects");
      setTimeout(() => setErrorMsg(""), 5000); // Reset, so we can try loading again after 5 seconds
      return [];
    }
  }

  async function getVersions(): Promise<string[]> {
    if (project === "none") return [];

    if (errorMsg) return []; // Failed to load, prevent loading again

    try {
      const versions = await ProjectRepository.getVersions(project);
      return versions.map((v) => v.name);
    } catch (e: any) {
      setErrorMsg("Failed to load versions");
      setTimeout(() => setErrorMsg(""), 5000); // Reset, so we can try loading again after 5 seconds
      return [];
    }
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
          dataSource={getProjects()}
          onChange={(project) => {
            setProject(project);
            validate("project", project);
          }}
          value={project || "none"}
          errorMsg={
            validation.projectMissing ? "Please select a Project" : undefined
          }
        />

        <DataSelect
          emptyMessage="Please select a Version"
          label="Version"
          dataSource={getVersions()}
          onChange={(version) => {
            setVersion(version);
            validate("version", version);
          }}
          value={version || "none"}
          errorMsg={
            validation.versionMissing ? "Please select a Version" : undefined
          }
        />

        <TextField
          fullWidth
          label="Token"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            validate("token", e.target.value);
          }}
          error={validation.tokenMissing}
          helperText={
            validation.tokenMissing ? "Please enter a Token" : undefined
          }
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
