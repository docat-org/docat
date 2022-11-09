import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NavigationTitle from "../components/NavigationTitle";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/pages/Claim.module.css";

export default function Claim(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [project, setProject] = useState<string>("none");
  const [token, setToken] = useState<string>("");
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    ProjectRepository.get().then((projects) => {
      setProjects(projects);
      setLoading(false);
    });
  }, []);

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
    return <div className={styles["loading-spinner"]}></div>;
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

        <FormControl className={styles["claim-form"]}>
          <InputLabel id="project-label">Project</InputLabel>
          <Select
            className={styles["project-select"]}
            labelId="project-label"
            onChange={(e) => setProject(e.target.value)}
            value={project}
            defaultValue="none"
            label="Project"
          >
            <MenuItem value="none" disabled>
              Select a project
            </MenuItem>
            {projects.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>

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
        </FormControl>
      </div>
      <div className={styles["footer-container"]}>
        <Footer />
      </div>
    </div>
  );
}
