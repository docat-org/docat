import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Banner from "../components/Banner";
import DocumentControlButtons from "../components/DocumentControlButtons";
import ProjectDetails from "../models/ProjectDetails";
import ProjectRepository from "../repositories/ProjectRepository";

import styles from "./../style/pages/Docs.module.css";

export default function Docs(): JSX.Element {
  const proj = useParams().project || "";
  const ver = useParams().version || "latest";
  const location = useParams().page || "index.html";
  const hideControls = useSearchParams()[0].get("hide-ui") === "true";

  const [project] = useState<string>(proj);
  const [version, setVersion] = useState<string>(ver);
  const [page, setPage] = useState<string>(location);
  const [hideUi, setHideUi] = useState<boolean>(hideControls);
  const [versions, setVersions] = useState<ProjectDetails[]>([]);

  const iFrameRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  document.title = `${project} | docat`;

  const updateRoute = useCallback(
    (
      project: string,
      version: string,
      page: string,
      hideControls: boolean
    ): void => {
      window.history.replaceState(
        {},
        "",
        `/${project}/${version}/${page}${hideControls ? "?hide-ui=true" : ""}`
      );
    },
    []
  );

  updateRoute(project, version, page, hideUi);

  useEffect(() => {
    if (!project) {
      setErrorMessage("Project not found");
      return;
    }

    ProjectRepository.getVersions(project).then((allVersions) => {
      if (!allVersions) {
        setErrorMessage("Project not found");
        return;
      }

      if (version === "latest") {
        const latestVersion = allVersions[0].name;
        setVersion(latestVersion);
        updateRoute(project, latestVersion, page, hideUi);
        return;
      }

      setVersions(
        allVersions.sort((a, b) => ProjectRepository.compareVersions(a, b))
      );

      const versionsAndTags = allVersions
        .map((v) => [v.name, ...v.tags])
        .flat();

      if (!versionsAndTags.includes(version)) {
        setErrorMessage("Version not found");
        return;
      }
    });
  }, [project, version, page, hideUi, updateRoute]);

  function handleVersionChange(v: string): void {
    setVersion(v);
    updateRoute(project, v, page, hideUi);
  }

  function handleHideControls(): void {
    updateRoute(project, version, page, true);
    setHideUi(true);
  }

  function onIframeLocationChanged(): void {
    if (!iFrameRef.current) return;

    // update the path in the url
    // @ts-ignore
    const path: string = iFrameRef.current.contentWindow?.location.href;
    const page = path.split(`${version}/`)[1];

    if (!page) return;

    setPage(page);
    updateRoute(project, version, page, hideUi);

    // make all links in iframe open in new tab
    // @ts-ignore
    iFrameRef.current.contentDocument
      .querySelectorAll("a")
      .forEach((a: HTMLAnchorElement) => {
        if (!a.href.startsWith(window.location.origin)) {
          // open all foreign links in a new tab
          a.setAttribute("target", "_blank");
        }
      });
  }

  return (
    <>
      <Banner errorMsg={errorMessage}/>
      {!errorMessage && (
        <>
          <iframe
            title="docs"
            ref={iFrameRef}
            src={ProjectRepository.getProjectDocsURL(project, version, page)}
            onLoad={onIframeLocationChanged}
            className={styles["docs-iframe"]}
          ></iframe>

          {hideUi || (
            <DocumentControlButtons
              version={version}
              versions={versions}
              onVersionChange={handleVersionChange}
              onHideUi={handleHideControls}
            />
          )}
        </>
      )}
    </>
  );
}
