import { useState } from "react";
import Banner from "../components/Banner";
import FileInput from "../components/FileInput";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NavigationTitle from "../components/NavigationTitle";
import InputField from "../components/TextInput";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/pages/Upload.module.css";

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
    } catch (e) {
      console.error(e);
      setUploadError(true);
    }
    setIsUploading(false);
  }

  if (isUploading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <>
      <Header />
      <Banner
        errorMsg={uploadError ? "Failed to upload documentation." : ""}
        successMsg={uploadSuccess ? "Documentation uploaded successfully." : ""}
      />
      <div className={styles["upload"]}>
        <NavigationTitle
          title="Upload Documentation"
          descriptionElement={
            <p>
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
          }
        />

        <form className={styles["upload-form"]} onSubmit={upload}>
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

          <button className={styles["upload-button"]} type="submit">
            Upload
          </button>
        </form>
      </div>
      <div className={styles["footer-container"]}>
        <Footer />
      </div>
    </>
  );
}
