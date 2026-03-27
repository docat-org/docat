import { useEffect, useState, useRef, JSX } from 'react'
import ProjectRepository from '../repositories/ProjectRepository'
import type ProjectVersion from '../models/ProjectVersion'
import NotFound from './NotFound'
import DocumentControlButtons from '../components/DocumentControlButtons'
import IFrame from '../components/IFrame'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'
import { useProjects } from '../data-providers/ProjectDataProvider'
import LoadingPage from './LoadingPage'
import { isProjectVersionEqual } from '../models/ProjectVersion'

export default function Docs(): JSX.Element {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { showMessage, clearMessages } = useMessageBanner()

  const [versions, setVersions] = useState<ProjectVersion[]>([])
  const [displayVersion, setDisplayVersion] = useState<ProjectVersion | null>(null)
  const [notFound, setNotFound] = useState<boolean>(false)
  const { state: { projects } } = useProjects()

  const page = useRef(params['*'] ?? '')
  const hash = useRef(location.hash)

  const [project, setProject] = useState<string>(params.project ?? '')
  const [version, setVersion] = useState<string>(params.version ?? 'latest')
  const [hideUi, setHideUi] = useState<boolean>(searchParams.get('hide-ui') === '' || searchParams.get('hide-ui') === 'true')
  const [iframeUpdateTrigger, setIframeUpdateTrigger] = useState<number>(0)

  // This provides the url for the iframe.
  // It is always the same, except when the version changes,
  // as this memo will trigger a re-render of the iframe, which
  // is not needed when only the page or hash changes, because
  // the iframe keeps track of that itself.
  const [iFrameSrc, setIFrameSrc] = useState<{url: string, updateCounter: number}>({url: '', updateCounter: 0})
  useEffect(() => {
    if (displayVersion == null) {
      setIFrameSrc({url: '', updateCounter: iframeUpdateTrigger})
      return
    }
    const newUrl = ProjectRepository.getProjectDocsURL(project, displayVersion.name, page.current, hash.current)
    setIFrameSrc({url: newUrl, updateCounter: iframeUpdateTrigger})
  }, [displayVersion, project, iframeUpdateTrigger])

  useEffect(() => {
    if (projects == null) {
      return
    }
    const matchingProject = projects.find((p) => p.name === project)
    if (matchingProject == null) {
      setNotFound(true)
      console.error(`Project '${project}' doesn't exist`)
      return
    }
    if (ProjectRepository.isVersionListEqual(versions, matchingProject.versions)) {
      return
    }
    setVersions(matchingProject.versions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, projects, setVersions]);

  const buildBrowserUrl = (project: string, version: string, page: string, hash: string, hideUi: boolean): string => {
    return `/${project}/${version}/${page}${hideUi ? '?hide-ui' : ''}${hash}`
  }

  const getShareUrl = (options: { useLatest: boolean, hideUi: boolean }): string => {
    return buildBrowserUrl(project, options.useLatest ? 'latest' : displayVersion?.name ?? 'latest', page.current, hash.current, options.hideUi)
  }

  const updateUrl = (newProject: string, newVersion: string, hideUi: boolean): void => {
    window.history.pushState(null, '', buildBrowserUrl(newProject, newVersion, page.current, hash.current, hideUi))
  }

  useEffect(() => {
    if (versions.length === 0) {
      return
    }

    if (version === 'latest') {
      const latestVersion = ProjectRepository.getLatestVersion(versions)
      if (isProjectVersionEqual(displayVersion, latestVersion)) {
        return
      }
      setDisplayVersion(latestVersion)
    } else {
      const matchingVersion = versions.find((v) => v.name === version || v.tags.includes(version))
      if (matchingVersion) {
        if (isProjectVersionEqual(displayVersion, matchingVersion)) {
          return
        }
        setDisplayVersion(matchingVersion)
      } else {
        setNotFound(true)
        console.error(`Version '${version}' doesn't exist`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versions, version])

  useEffect(() => {
    if (versions.length === 0) {
      return
    }
    const latestVersion = ProjectRepository.getLatestVersion(versions)
    if (isProjectVersionEqual(displayVersion, latestVersion)) {
      clearMessages()
    } else {
      showMessage({
        content: 'You are viewing an outdated version of the documentation.',
        type: 'warning',
        showMs: null
      })
    }
  }, [displayVersion, versions, showMessage, clearMessages])

  const updateTitle = (newTitle: string): void => {
    document.title = newTitle
  }

  const iFramePageChanged = (urlPage: string, urlHash: string, title?: string): void => {
    if (title != null && title !== document.title) {
      updateTitle(title)
    }
    if (urlPage === page.current) {
      return
    }
    page.current = urlPage
    hash.current = urlHash
    updateUrl(project, version, hideUi)
  }

  const iFrameHashChanged = (newHash: string): void => {
    if (newHash === hash.current) {
      return
    }
    hash.current = newHash
    updateUrl(project, version, hideUi)
  }

  const iFrameNotFound = (): void => {
    setNotFound(true)
  }

  const iFrameFaviconChanged = (faviconUrl: string | null): void => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (favicon == null || faviconUrl == null) {
      return
    }
    favicon.href = faviconUrl
  }

  useEffect(() => {
    const urlProject = params.project ?? ''
    const urlVersion = params.version ?? 'latest'
    const urlPage = params['*'] ?? ''
    const urlHash = location.hash
    const urlHideUi = searchParams.get('hide-ui') === '' || searchParams.get('hide-ui') === 'true'

    // update the state to the url params on first load
    setNotFound(false)
    setProject(urlProject)
    setVersion(urlVersion)
    setHideUi(urlHideUi)

    if (urlPage !== page.current) {
      page.current = urlPage
    }
    if (urlHash !== hash.current) {
      hash.current = urlHash
    }
    setIframeUpdateTrigger((v) => v + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  if (projects === null) {
    return <LoadingPage />
  }

  if (displayVersion == null || notFound) {
    return <NotFound />
  }

  return (
    <>
      <IFrame
        src={iFrameSrc}
        onPageChanged={iFramePageChanged}
        onHashChanged={iFrameHashChanged}
        onTitleChanged={updateTitle}
        onNotFound={iFrameNotFound}
        onFaviconChanged={iFrameFaviconChanged}
      />
      {!hideUi && (
        <DocumentControlButtons
          version={displayVersion.name}
          versions={versions}
          onVersionChange={(newVersion) => {
            updateUrl(project, newVersion, hideUi)
            setVersion(newVersion)
          }}
          getShareUrl={getShareUrl}
        />
      )}
    </>
  )
}
