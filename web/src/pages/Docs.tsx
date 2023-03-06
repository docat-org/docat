/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
/*
  the iFrameRef is not really compatiple with ts,
  and we need to use some of it's members, which is unsafe
*/

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import DocumentControlButtons from '../components/DocumentControlButtons'
import { useProjects } from '../data-providers/ProjectDataProvider'
import ProjectDetails from '../models/ProjectDetails'
import ProjectRepository from '../repositories/ProjectRepository'

import styles from './../style/pages/Docs.module.css'
import LoadingPage from './LoadingPage'
import NotFound from './NotFound'

export default function Docs(): JSX.Element {
  const projectParam = useParams().project ?? ''
  const versionParam = useParams().version ?? 'latest'
  const pageParam = useParams().page ?? 'index.html'
  const hideUiParam = useSearchParams()[0].get('hide-ui') === 'true'

  const [project] = useState<string>(projectParam)
  const [version, setVersion] = useState<string>(versionParam)
  const [page, setPage] = useState<string>(pageParam)
  const [hideUi, setHideUi] = useState<boolean>(hideUiParam)
  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false)

  const { projectsWithHiddenVersions: projects } = useProjects()
  const iFrameRef = useRef(null)

  document.title = `${project} | docat`

  if (project === '') {
    setLoadingFailed(true)
  }

  const updateRoute = useCallback(
    (
      project: string,
      version: string,
      page: string,
      hideControls: boolean
    ): void => {
      const oldUrl = window.location.href

      const newUrl = ProjectRepository.getDocPageURL(
        oldUrl,
        project,
        version,
        page,
        hideControls
      )

      if (newUrl !== oldUrl) {
        window.history.pushState({}, '', newUrl)
      }
    },
    []
  )

  updateRoute(project, version, page, hideUi)

  useEffect(() => {
    if (project === '' || project === 'none') {
      setVersions([])
      return
    }

    if (projects == null || projects.length === 0) {
      return
    }

    try {
      const matchingProjects = projects.filter((p) => p.name === project)

      if (matchingProjects.length !== 1) {
        setLoadingFailed(true)
        return
      }

      let res = matchingProjects[0].versions

      if (res.length === 0) {
        setLoadingFailed(true)
        return
      }

      res = res.sort((a, b) => ProjectRepository.compareVersions(a, b))
      setVersions(res)

      if (version !== 'latest') {
        // custom version -> check if it exists
        const versionsAndTags = res.map((v) => [v.name, ...v.tags]).flat()

        if (!versionsAndTags.includes(version)) {
          // version does not exist -> fail
          setLoadingFailed(true)
          console.log("Version doesn't exist")
        }

        return
      }

      // latest version -> check if there is a latest tag
      const versionWithLatestTag = res.find((v) =>
        (v.tags ?? []).includes('latest')
      )

      // if there is a latest tag, use it,
      // otherwise use the latest version by sorting
      const latestVersion =
        versionWithLatestTag != null
          ? versionWithLatestTag.name
          : res[res.length - 1].name

      setVersion(latestVersion)
      updateRoute(project, latestVersion, page, hideUi)
    } catch (e) {
      console.error(e)
      setLoadingFailed(true)
    }
  }, [project, projects, version, page, hideUi, updateRoute])

  const handleVersionChange = (v: string): void => {
    setVersion(v)
    updateRoute(project, v, page, hideUi)
  }

  const handleHideControls = (): void => {
    updateRoute(project, version, page, true)
    setHideUi(true)
  }

  /**
   * This makes all external links in the iFrame open in a new tab
   * and updates the page url when the location in the iFrame changes
   */
  const onIframeLocationChanged = (): void => {
    if (iFrameRef?.current == null) {
      return
    }

    // update the path in the url
    // @ts-expect-error - ts does not find the location on the iframe
    const path: string = iFrameRef.current.contentWindow.location.href as string
    const page = path.split(`${version}/`)[1]

    if (page == null || page.trim().length < 1) {
      return
    }

    setPage(page)
    updateRoute(project, version, page, hideUi)

    // make all links in iframe open in new tab
    // @ts-expect-error - ts does not find the document on the iframe
    iFrameRef.current.contentDocument
      .querySelectorAll('a')
      .forEach((a: HTMLAnchorElement) => {
        if (!a.href.startsWith(window.location.origin)) {
          a.setAttribute('target', '_blank')
        }
      })
  }

  if (versions == null || versions.length === 0) {
    return <LoadingPage />
  }

  if (loadingFailed) {
    return <NotFound />
  }

  return (
    <>
      <iframe
        title="docs"
        ref={iFrameRef}
        src={ProjectRepository.getProjectDocsURL(project, version, page)}
        onLoad={onIframeLocationChanged}
        className={styles['docs-iframe']}
      ></iframe>

      {!hideUi && (
        <DocumentControlButtons
          version={version}
          versions={versions}
          onVersionChange={handleVersionChange}
          onHideUi={handleHideControls}
        />
      )}
    </>
  )
}
