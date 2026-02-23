import { useEffect, useMemo, useState, useRef } from 'react'
import ProjectRepository from '../repositories/ProjectRepository'
import type ProjectDetails from '../models/ProjectDetails'
import LoadingPage from './LoadingPage'
import NotFound from './NotFound'
import DocumentControlButtons from '../components/DocumentControlButtons'
import IFrame from '../components/IFrame'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'
import IframeNotFound from './IframePageNotFound'

export default function Docs(): JSX.Element {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { showMessage, clearMessages } = useMessageBanner()

  const [iframePageNotFound, setIframePageNotFound] = useState<boolean>(false)
  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false)

  const project = useRef(params.project ?? '')
  const page = useRef(params['*'] ?? '')
  const hash = useRef(location.hash)

  const [version, setVersion] = useState<string>(params.version ?? 'latest')
  const [hideUi, setHideUi] = useState<boolean>(searchParams.get('hide-ui') === '' || searchParams.get('hide-ui') === 'true')
  const [iframeUpdateTrigger, setIframeUpdateTrigger] = useState<number>(0)

  // This provides the url for the iframe.
  // It is always the same, except when the version changes,
  // as this memo will trigger a re-render of the iframe, which
  // is not needed when only the page or hash changes, because
  // the iframe keeps track of that itself.
  const iFrameSrc = useMemo(() => {
    return ProjectRepository.getProjectDocsURL(
      project.current,
      version,
      page.current,
      hash.current
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, iframeUpdateTrigger])

  useEffect(() => {
    if (project.current === '') {
      return
    }

    void (async (): Promise<void> => {
      try {
        let allVersions = await ProjectRepository.getVersions(project.current)
        if (allVersions.length === 0) {
          setLoadingFailed(true)
          return
        }

        allVersions = allVersions.sort((a, b) =>
          ProjectRepository.compareVersions(a, b)
        )
        setVersions(allVersions)

        const latestVersion =
          ProjectRepository.getLatestVersion(allVersions).name
        if (version === 'latest') {
          if (latestVersion === 'latest') {
            return
          }
          setVersion(latestVersion)
          return
        }

        // custom version -> check if it exists
        // if it does. do nothing, as it should be set already
        const versionsAndTags = allVersions
          .map((v) => [v.name, ...v.tags])
          .flat()
        if (versionsAndTags.includes(version)) {
          return
        }

        // version does not exist -> fail
        setLoadingFailed(true)
        console.error(`Version '${version}' doesn't exist`)
      } catch (e) {
        console.error(e)
        setLoadingFailed(true)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  /** Encodes the url for the current page.
   * @example
   * getUrl('project', 'version', 'path/to/page.html', '#hash', false) -> '/project/version/path/to/page.html#hash'
   */
  const getUrl = (
    project: string,
    version: string,
    page: string,
    hash: string,
    hideUi: boolean
  ): string => {
    return `/${project}/${version}/${encodeURI(page)}${hash}${hideUi ? '?hide-ui' : ''}`
  }

  const updateUrl = (newVersion: string, hideUi: boolean): void => {
    const url = getUrl(
      project.current,
      newVersion,
      page.current,
      hash.current,
      hideUi
    )
    window.history.pushState(null, '', url)
  }

  const updateTitle = (newTitle: string): void => {
    document.title = newTitle
  }

  // Keep compatibility with encoded page path
  useEffect(() => {
    updateUrl(version, hideUi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const iFramePageChanged = (urlPage: string, urlHash: string, title?: string): void => {
    if (title != null && title !== document.title) {
      updateTitle(title)
    }
    if (urlPage === page.current) {
      return
    }
    page.current = urlPage
    hash.current = urlHash
    updateUrl(version, hideUi)
  }

  const iFrameHashChanged = (newHash: string): void => {
    if (newHash === hash.current) {
      return
    }
    hash.current = newHash
    updateUrl(version, hideUi)
  }

  const iFrameNotFound = (): void => {
    setIframePageNotFound(true)
  }

  const iFrameFaviconChanged = (faviconUrl: string | null): void => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (favicon == null || faviconUrl == null) {
      return
    }
    favicon.href = faviconUrl
  }

  const onVersionChanged = (newVersion: string): void => {
    if (newVersion === version) {
      return
    }
    setVersion(newVersion)
    updateUrl(newVersion, hideUi)
  }

  useEffect(() => {
    const urlProject = params.project ?? ''
    const urlVersion = params.version ?? 'latest'
    const urlPage = params['*'] ?? ''
    const urlHash = location.hash
    const urlHideUi = searchParams.get('hide-ui') === '' || searchParams.get('hide-ui') === 'true'

    // update the state to the url params on first loadon
    if (urlProject !== project.current) {
      setVersions([])
      project.current = urlProject
    }

    if (urlVersion !== version) {
      setVersion(urlVersion)
    }

    if (urlHideUi !== hideUi) {
      setHideUi(urlHideUi)
    }

    if (urlPage !== page.current) {
      page.current = urlPage
      setIframeUpdateTrigger((v) => v + 1)
    }
    if (urlHash !== hash.current) {
      hash.current = urlHash
      setIframeUpdateTrigger((v) => v + 1)
    }

    setIframePageNotFound(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    // check every time the version changes whether the version
    // is the latest version and if not, show a banner
    if (versions.length === 0) {
      return
    }

    const latestVersion = ProjectRepository.getLatestVersion(versions).name
    if (version === latestVersion) {
      clearMessages()
      return
    }

    showMessage({
      content: 'You are viewing an outdated version of the documentation.',
      type: 'warning',
      showMs: null
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, versions])

  if (loadingFailed || project.current === '') {
    return <NotFound />
  }

  if (iframePageNotFound) {
    return (
      <IframeNotFound
        project={project.current}
        version={version}
        hideUi={hideUi}
      />
    )
  }

  if (versions.length === 0) {
    return <LoadingPage />
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
          version={version}
          versions={versions}
          onVersionChange={onVersionChanged}
        />
      )}
    </>
  )
}
