import { TextField } from "@mui/material";
import { useState } from "react";
import Banner from "../components/Banner";
import DataSelect from "../components/DataSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NavigationTitle from "../components/NavigationTitle";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/pages/Claim.module.css";

export default function Claim(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [project, setProject] = useState<string>("none");
  const [token, setToken] = useState<string>("");

  async function claim(): Promise<void> {
    if (!project || project === "none") return;

    try {
      setLoading(true);

      const response = await ProjectRepository.claim(project);
      setToken(response.token);

      setErrorMsg("");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
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
    <div className={styles["claim"]}>
      <Header />
      <Banner errorMsg={errorMsg} />
      <div className={styles["claim-content"]}>
        <NavigationTitle
          title="Claim Token"
          descriptionText="Please make sure to store this token safely, as only one token can be generated per project and you will not be able to claim it again."
        />

        <DataSelect
          emptyMessage="Please select a Project"
          label="Project"
          dataSource={ProjectRepository.get()}
          onChange={(p) => setProject(p)}
        />

        {token && (
          <TextField
            className={styles["token-output"]}
            label="Token"
            inputProps={{
              readOnly: true,
            }}
            value={token}
          >
            {token}
          </TextField>
        )}

        <button
          className={styles["claim-button"]}
          type="submit"
          onClick={claim}
        >
          Claim
        </button>
      </div>
      <div className={styles["footer-container"]}>
        <Footer />
      </div>
    </div>
  );
}
