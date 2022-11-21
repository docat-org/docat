import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

// @ts-ignore ts can't read symbols from a md file
import gettingStarted from "./../assets/getting-started.md";
import Header from "../components/Header";
import LoadingPage from "./LoadingPage";

import styles from "./../style/pages/Help.module.css";
import UploadButton from "../components/UploadButton";

export default function Help(): JSX.Element {
  document.title = "Help | docat";

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  function replaceLinks(text: string): string {
    const protocol = document.location.protocol;
    const host = document.location.hostname;
    const port = document.location.port ? `:${document.location.port}` : "";

    const currentUrl = `${protocol}//${host}${port}`;

    return text.replaceAll("http://localhost:8000", currentUrl);
  }

  useEffect(() => {
    fetch(gettingStarted)
      .then((res: Response) => res.text())
      .then((text: string) => {
        const content = replaceLinks(text);
        setContent(content);
      });

    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Header />
      <ReactMarkdown
        className={styles["markdown-container"]}
        children={content}
      />
      <UploadButton isSingleButton={true} />
    </>
  );
}
