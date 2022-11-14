import { TextField } from "@mui/material";
import { useState } from "react";
import FileInput from "../components/FileInput";
import PageLayout from "../components/PageLayout";
import StyledForm from "../components/StyledForm";
import ProjectRepository from "../repositories/ProjectRepository";
import LoadingPage from "./LoadingPage";

export default function Upload(): JSX.Element {
  document.title = "Upload | docat";

  const [project, setProject] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  function resetForm(): void {
    setProject("");
    setVersion("");
    setFile(undefined);
  }

  async function upload(): Promise<void> {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file!);

      await ProjectRepository.upload(project, version, formData);

      resetForm();

      setUploadSuccess(true);
    } catch (e) {
      console.error(e);
      setUploadError(true);
    } finally {
      setIsUploading(false);
    }
  }

  if (isUploading) {
    return <LoadingPage />;
  }

  const description = (
    <p>
      If you want to automate the upload of your documentation consider using{" "}
      <code>curl</code> to post it to the server. There are some examples in the{" "}
      <a
        href="https://github.com/docat-org/docat/"
        target="_blank"
        rel="noreferrer"
      >
        docat repository
      </a>
      .
    </p>
  );

  return (
    <PageLayout
      errorMsg={uploadError ? "Failed to upload documentation." : ""}
      successMsg={uploadSuccess ? "Documentation uploaded successfully." : ""}
      title="Upload Documentation"
      description={description}
    >
      <StyledForm>
        <TextField
          fullWidth
          label="Project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          {project}
        </TextField>

        <TextField
          fullWidth
          label="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          {version}
        </TextField>

        <FileInput
          label="Zip File"
          required={true}
          file={file}
          onChange={(file) => setFile(file)}
          okTypes={["application/zip"]}
        ></FileInput>

        <button type="submit" onClick={upload}>
          Upload
        </button>
      </StyledForm>
    </PageLayout>
  );
}
