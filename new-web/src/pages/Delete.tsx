import { FormGroup, TextField } from "@mui/material";
import { useState } from "react";
import Banner from "../components/Banner";
import DataSelect from "../components/DataSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NavigationTitle from "../components/NavigationTitle";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/pages/Delete.module.css";

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
    return (
      <>
        <Header /> <div className="loading-spinner"></div> <Footer />{" "}
      </>
    );
  }

  return (
    <div className={styles["delete"]}>
      <Header />
      <Banner
        errorMsg={errorMsg}
        successMsg={
          deleteSuccessful ? "Documentation deleted successfully" : ""
        }
      />

      <div className={styles["delete-content"]}>
        <NavigationTitle title="Delete Documentation" />
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

        <FormGroup>
          <TextField
            label="Token"
            className={styles["token-input"]}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          >
            {token}
          </TextField>
        </FormGroup>
        
        <button
          className={styles["delete-button"]}
          type="submit"
          onClick={deleteDocumentation}
        >
          Delete
        </button>
      </div>
      <div className={styles["footer-container"]}>
        <Footer />
      </div>
    </div>
  );
}
