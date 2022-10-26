import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import "./../style/Help.css";

// @ts-ignore ts can't read symbols from a md file
import gettingStarted from "./../assets/getting-started.md";

export default function Help(): JSX.Element {
  document.title = "Help | docat";

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(gettingStarted)
      .then((res) => res.text())
      .then((text) => {
        const content = text.replace(
          /http:\/\/localhost:8000/g,
          `${document.location.protocol}//${document.location.hostname}${
            document.location.port !== "" ? ":" + document.location.port : ""
          }`
        );

        setContent(content);
      });

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return <ReactMarkdown className="markdown-container" children={content} />;
}