import { useState } from "react";
import { Link } from "react-router-dom";

import { useConfig } from "../data-providers/ConfigDataProvider";

import styles from "./../style/components/Header.module.css";

export default function Header(): JSX.Element {
  const defaultHeader = (
    <>
      <img alt="docat logo" src={require("../assets/logo.png")} />
      <h1>DOCAT</h1>
    </>
  );
  const [header, setHeader] = useState<any>(defaultHeader);
  const config = useConfig();

  if (config.headerHTML && header === defaultHeader) {
    setHeader(<div dangerouslySetInnerHTML={{ __html: config.headerHTML }} />);
  }

  return (
    <div className={styles["header"]}>
      <Link to="/">{header}</Link>
    </div>
  );
}
