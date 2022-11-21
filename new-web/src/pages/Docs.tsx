import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DocumentControlButtons from "../components/DocumentControlButtons";
import ProjectDetails from "../models/ProjectDetails";
import ProjectRepository from "../repositories/ProjectRepository";

import styles from "./../style/pages/Docs.module.css";
import LoadingPage from "./LoadingPage";

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

  document.title = `${project} | docat`;

  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

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
    if (!project || project === "none") {
      setVersions([]);
      return;
    }

    ProjectRepository.getVersions(project)
      .then((res) => {
        if (res.length === 0) {
          throw new Response("Project not found", { status: 404 });
        }

        res = res.sort((a, b) => ProjectRepository.compareVersions(a, b));

        setVersions(res);

        if (version === "latest") {
          const versionWithLatestTag = res.find((v) =>
            (v.tags || []).includes("latest")
          );

          const latestVersion = versionWithLatestTag
            ? versionWithLatestTag.name
            : res[res.length - 1].name;

          setVersion(latestVersion);
          updateRoute(project, latestVersion, page, hideUi);
        } else {
          const versionsAndTags = res.map((v) => [v.name, ...v.tags]).flat();

          if (!versionsAndTags.includes(version)) {
            throw new Response("Version not found", { status: 404 });
          }
        }
      })
      .catch((e: any) => {
        console.error(e);
        throw new Response("Failed to load versions", { status: 500 });
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

  if (!versions.length) {
    return <LoadingPage />;
  }

  return (
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
  );
}
