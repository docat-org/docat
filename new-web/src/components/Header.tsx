import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectRepository from "../repositories/ProjectRepository";
import styles from "./../style/components/Header.module.css";

export default function Header(): JSX.Element {
  const defaultHeader = (
    <>
      <img alt="docat logo" src={require("../assets/logo.png")} />
      <h1>DOCAT</h1>
    </>
  );

  const [header, setHeader] = useState<JSX.Element>(defaultHeader);

  useEffect(() => {
    // try to get a custom header from the backend, or use the default
    ProjectRepository.getConfig().then((config) => {
      // @ts-ignore
      const header = config.headerHTML;

      if (!header) return;

      setHeader(<div dangerouslySetInnerHTML={{ __html: header }} />);
    });
  });

  return (
    <div className={styles["header"]}>
      <Link to="/">{header}</Link>
    </div>
  );
}
