/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
/*
  the iFrameRef is not really compatiple with ts,
*/

import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
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
  const hashParam = useLocation().hash.split('?')[0] ?? ''
  const hideUiParam = useSearchParams()[0].get('hide-ui') === 'true' || useLocation().hash.split('?')[1] === 'hide-ui=true'

  const [project, setProject] = useState<string>('')
  const [version, setVersion] = useState<string>('')
  const [page, setPage] = useState<string>('')
  const [hash, setHash] = useState<string>('')
  const [hideUi, setHideUi] = useState<boolean>(false)

  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false)

  const iFrameRef = useRef<HTMLIFrameElement>(null)

  document.title = `${project} | docat`

  if (projectParam === '') {
    setLoadingFailed(true)
  }

  const updateURL = (newProject: string, newVersion: string, newPage: string, newHash: string, newHideUi: boolean): void => {
    let url = `#/${newProject}/${newVersion}/${newPage}`

    if (newHash.length > 0) {
      url += newHash
    }

    if (newHideUi) {
      url += '?hide-ui=true'
    }

    if (project === newProject && version === newVersion && page === newPage && hash === newHash && hideUi === newHideUi) {
      // no change
      return
    }

    const oldVersion = version
    const oldPage = page

    setProject(newProject)
    setVersion(newVersion)
    setPage(newPage)
    setHash(newHash)
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

  const onIFrameLocationChanged = (url?: string): void => {
    if (url == null) {
      return
    }

    url = url.split('/doc/')[1]
    if (url == null) {
      console.error('IFrame URL did not contain "/doc/"')
      return
    }

    // make all external links in iframe open in new tab
    // @ts-expect-error - ts does not find the document on the iframe
    iFrameRef.current.contentDocument
      .querySelectorAll('a')
      .forEach((a: HTMLAnchorElement) => {
        if (!a.href.startsWith(window.location.origin)) {
          a.setAttribute('target', '_blank')
        }
      })

    const parts = url.split('/')
    const urlProject = parts[0]
    const urlVersion = parts[1]
    const urlPageAndHash = parts.slice(2).join('/')
    const hashIndex = urlPageAndHash.includes('#') ? urlPageAndHash.indexOf('#') : urlPageAndHash.length
    const urlPage = urlPageAndHash.slice(0, hashIndex)
    const urlHash = urlPageAndHash.slice(hashIndex)

    if (urlProject !== project || urlVersion !== version || urlPage !== page || urlHash !== hash) {
      updateURL(urlProject, urlVersion, urlPage, urlHash, hideUi)
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

        updateURL(project, versionToUse, page, hash, hideUi)
        setVersions(allVersions)
        setLoadingFailed(false)
      } catch (e) {
        console.error(e)
        setLoadingFailed(true)
      }
    })()
  }, [project])

  useEffect(() => {
    setProject(p => {
      if (p !== '') {
        return p
      }

      updateURL(projectParam, versionParam, pageParam, hashParam, hideUiParam)
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
        src={ProjectRepository.getProjectDocsURL(project, version, page, hash)}
        title="docs"
        className={styles['docs-iframe']}
        onLoad={() => {
          // @ts-expect-error ts can't find contentWindow
          onIFrameLocationChanged(iFrameRef.current?.contentWindow.location.href)
        }}
      />

      {!hideUi && (
        <DocumentControlButtons
          version={version}
          versions={versions}
          onVersionChange={(v) => updateURL(project, v, page, hash, hideUi)}
          onHideUi={() => updateURL(project, version, page, hash, true)}
        />
      )}
    </>
  )
}
