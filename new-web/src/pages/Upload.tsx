import { ArrowBackIos } from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";
import FileInput from "../components/FileInput";
import Footer from "../components/Footer";
import Header from "../components/Header";
import InputField from "../components/TextInput";
import ProjectRepository from "../repositories/ProjectRepository";
import "./../style/pages/Upload.css";

export default function Upload(): JSX.Element {
  document.title = "Upload | docat";

  const [project, setProject] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  async function upload(): Promise<void> {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file!);

      await ProjectRepository.upload(project, version, formData);

      setProject("");
      setVersion("");
      setFile(undefined);

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (e) {
      console.error(e);
      setUploadError(true);
      setTimeout(() => setUploadError(false), 5000);
    }
    setIsUploading(false);
  }

  if (isUploading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <>
      <Header />
      {uploadSuccess && (
        <div className="success-banner">
          Documentation uploaded successfully.
        </div>
      )}
      {uploadError && (
        <div className="error-banner">Failed to upload documentation.</div>
      )}
      <div className="upload">
        <div className="upload-header">
          <Link to="/">
            <ArrowBackIos />
          </Link>
          <h1 className="upload-title">Upload Documentation</h1>
        </div>
        <p className="upload-remarks">
          If you want to automate the upload of your documentation consider
          using <code>curl</code> to post it to the server. There are some
          examples in the{" "}
          <a
            href="https://github.com/docat-org/docat/"
            target="_blank"
            rel="noreferrer"
          >
            docat repository
          </a>
          .
        </p>

        <form className="upload-form" onSubmit={upload}>
          <InputField
            label="Project:"
            required={true}
            onChange={(e) => {
              setProject(e.target.value);
              return e.target.value;
            }}
            placeholder="Type your project name here"
            value={project}
          />

          <InputField
            label="Version:"
            required={true}
            onChange={(e) => {
              setVersion(e.target.value);
              return e.target.value;
            }}
            placeholder="Type your version here"
            value={version}
          />

          <FileInput
            label="Zip File:"
            required={true}
            file={file}
            onChange={(file) => setFile(file)}
            okTypes={["application/zip"]}
          ></FileInput>

          <button className="upload-button" type="submit">
            Upload
          </button>
        </form>
      </div>
      <div className="footer-container">
        <Footer />
      </div>
    </>
  );
}
