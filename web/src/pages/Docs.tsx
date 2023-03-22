/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
/*
  the iFrameRef is not really compatiple with ts,
  and we need to use some of it's members, which is unsafe
*/

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import DocumentControlButtons from '../components/DocumentControlButtons'
import ProjectDetails from '../models/ProjectDetails'
import ProjectRepository from '../repositories/ProjectRepository'

import LoadingPage from './LoadingPage'
import NotFound from './NotFound'

import styles from './../style/pages/Docs.module.css'
import { uniqueId } from 'lodash'

export default function Docs (): JSX.Element {
  const projectParam = useParams().project ?? ''
  const versionParam = useParams().version ?? 'latest'
  const pageParam = useParams().page ?? 'index.html'
  const hideUiParam = useSearchParams()[0].get('hide-ui') === 'true'

  const [project, setProject] = useState<string>('')
  const [version, setVersion] = useState<string>('')
  const [page, setPage] = useState<string>('')
  const [hideUi, setHideUi] = useState<boolean>(false)

  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false)

  const iFrameRef = useRef(null)

  document.title = `${project} | docat`

  if (projectParam === '') {
    setLoadingFailed(true)
  }

  const updateURL = (newProject: string, newVersion: string, newPage: string, newHideUi: boolean): void => {
    const url = `#/${newProject}/${newVersion}/${newPage}${newHideUi ? '?hide-ui=true' : ''}`

    if (project === newProject && version === newVersion && page === newPage && hideUi === newHideUi) {
      // no change
      return
    }

    const oldVersion = version
    const oldPage = page

    setProject(newProject)
    setVersion(newVersion)
    setPage(newPage)
    setHideUi(newHideUi)

    if (oldVersion === 'latest' && newVersion !== 'latest') {
      // replace the url if 'latest' was updated to the actual version
      window.history.replaceState(null, '', url)
      return
    }

    if (oldPage === '' && newPage !== '') {
      // replace the url if the page was updated from '' to the actual page
      window.history.replaceState(null, '', url)
      return
    }

    window.history.pushState(null, '', url)
  }

  const onIFrameLocationChanged = (url: string): void => {
    url = url.split('/doc/')[1]
    if (url.length === 0) {
      // should never happen
      return
    }

    const parts = url.split('/')
    const urlProject = parts[0]
    const urlVersion = parts[1]
    const urlPage = parts.slice(2).join('/')

    if (urlProject !== project || urlVersion !== version || urlPage !== page) {
      updateURL(urlProject, urlVersion, urlPage, hideUi)
    }
  }

  useEffect(() => {
    if (project === '') {
      return
    }

    void (async (): Promise<void> => {
      try {
        let allVersions = await ProjectRepository.getVersions(project)

        if (allVersions.length === 0) {
          setLoadingFailed(true)
          return
        }

        allVersions = allVersions.sort((a, b) => ProjectRepository.compareVersions(a, b))
        let versionToUse = ''

        if (version === 'latest') {
          versionToUse = ProjectRepository.getLatestVersion(allVersions).name
        } else {
          // custom version -> check if it exists
          const versionsAndTags = allVersions.map((v) => [v.name, ...v.tags]).flat()
          if (!versionsAndTags.includes(version)) {
            // version does not exist -> fail
            setLoadingFailed(true)
            console.error("Version doesn't exist")
            return
          }

          versionToUse = version
        }

        updateURL(project, versionToUse, page, hideUi)
        setVersions(allVersions)
        setLoadingFailed(false)
      } catch (e) {
        console.error(e)
        setLoadingFailed(true)
      }
    })()
  }, [project])

  useEffect(() => {
    // set props equal to url params and update the url with the default values if empty
    setProject(p => {
      if (p !== '') {
        return p
      }

      updateURL(projectParam, versionParam, pageParam, hideUiParam)
      return projectParam
    })
  }, [])

  if (loadingFailed) {
    return <NotFound />
  }

  if (versions.length === 0) {
    return <LoadingPage />
  }

  return (
    <>
      <iframe
        ref={iFrameRef}
        key={uniqueId()}
        src={ProjectRepository.getProjectDocsURL(project, version, page)}
        title="docs"
        className={styles['docs-iframe']}
        onLoad={() => {
          // @ts-expect-error ts can't find contentWindow
          onIFrameLocationChanged(iFrameRef.current?.contentWindow.location.href as string)
        }}
      />

      {!hideUi && (
        <DocumentControlButtons
          version={version}
          versions={versions}
          onVersionChange={(v) => updateURL(project, v, page, hideUi)}
          onHideUi={() => updateURL(project, version, page, true)}
        />
      )}
    </>
  )
}
