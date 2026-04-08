import { useEffect, useMemo, useState, useRef, JSX } from 'react'
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
  const [versions, setVersions] = useState<ProjectDetails[] | null>()
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false)

  const project = useRef(params.project ?? '')
  const version = useRef(params.version ?? 'latest')
  const page = useRef(params['*'] ?? '')
  const hash = useRef(location.hash)

  const [hideUi, setHideUi] = useState<boolean>(
    searchParams.get('hide-ui') === '' || searchParams.get('hide-ui') === 'true'
  )
  const [iFrameUpdateTrigger, setIFrameUpdateTrigger] = useState<number>(0)

  // This provides the url for the iframe.
  // It is always the same, except when the version changes,
  // as this memo will trigger a re-render of the iframe, which
  // is not needed when only the page or hash changes, because
  // the iframe keeps track of that itself.
  const iFrameSrc = useMemo(() => {
    if (versions == null) {
      return ''
    }

    return ProjectRepository.getProjectDocsURL(
      project.current,
      version.current,
      page.current,
      hash.current
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iFrameUpdateTrigger])

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
    const newUrl = getUrl(
      project.current,
      newVersion,
      page.current,
      hash.current,
      hideUi
    )

    const currentUrl = location.pathname + location.search + location.hash
    if (newUrl !== currentUrl) {
      console.log(`Updating url from '${currentUrl}' to '${newUrl}'`)
      // avoid updating the url when it hasn't changed
      // because this results in the user having to click back twice or more.
      window.history.pushState(null, '', newUrl)
    }
  }

  const updateTitle = (newTitle: string): void => {
    document.title = newTitle
  }

  const triggerIFrameUpdate = (): void => {
    setIFrameUpdateTrigger((v) => v + 1)
  }

  const onIFramePageChanged = (
    urlPage: string,
    urlHash: string,
    title?: string
  ): void => {
    if (title != null && title !== document.title) {
      updateTitle(title)
    }

    if (urlPage === page.current) {
      return
    }

    page.current = urlPage
    hash.current = urlHash
    updateUrl(version.current, hideUi)
  }

  const onIFrameHashChanged = (newHash: string): void => {
    if (newHash === hash.current) {
      return
    }
    hash.current = newHash
    updateUrl(version.current, hideUi)
  }

  const onIFrameNotFound = (): void => {
    setIframePageNotFound(true)
  }

  const onIFrameFaviconChanged = (faviconUrl: string | null): void => {
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement | null
    if (favicon != null && faviconUrl != null) {
      favicon.href = faviconUrl
    }
  }

  const onVersionChanged = (newVersion: string): void => {
    if (newVersion === version.current) {
      return
    }

    version.current = newVersion
    triggerIFrameUpdate()
    updateUrl(newVersion, hideUi)
  }

  useEffect(() => {
    console.log('location hook')
    // hook to parse url parameters into the state on first load
    const urlProject = params.project ?? ''
    const urlVersion = params.version ?? 'latest'
    const urlPage = params['*'] ?? ''
    const urlHash = location.hash
    const urlHideUi =
      searchParams.get('hide-ui') === '' ||
      searchParams.get('hide-ui') === 'true'

    if (urlProject !== project.current) {
      setVersions([])
      project.current = urlProject
      triggerIFrameUpdate()
    }
    if (urlVersion !== version.current && urlVersion !== 'latest') {
      version.current = urlVersion
      triggerIFrameUpdate()
    }
    if (urlPage !== page.current) {
      page.current = urlPage
      triggerIFrameUpdate()
    }
    if (urlHash !== hash.current) {
      hash.current = urlHash
      triggerIFrameUpdate()
    }
    if (urlHideUi !== hideUi) {
      setHideUi(urlHideUi)
    }

    setIframePageNotFound(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    void (async (): Promise<void> => {
      try {
        const allVersions = await ProjectRepository.getVersions(project.current)
        if (allVersions.length === 0) {
          setLoadingFailed(true)
          return
        }

        const sortedVersions = allVersions.sort((a, b) =>
          ProjectRepository.compareVersions(a, b)
        )
        setVersions(sortedVersions)

        // custom version -> check if it exists
        // if it does, do nothing, as it should be set already
        const versionsAndTags = sortedVersions
          .map((v) => [v.name, ...v.tags])
          .flat()

        if (version.current === 'latest') {
          version.current =
            ProjectRepository.getLatestVersion(sortedVersions).name
        }
        triggerIFrameUpdate()

        if (
          versionsAndTags.length === 0 ||
          !versionsAndTags.includes(version.current)
        ) {
          setLoadingFailed(true)
          console.error(`Version '${version}' doesn't exist`)
        }
      } catch (e) {
        console.error(e)
        setLoadingFailed(true)
      }
    })()
  }, [project])

  useEffect(() => {
    // check every time the version changes whether the version
    // is the latest version and if not, show a banner
    if (versions == null || loadingFailed) {
      return
    }

    const latestVersion = ProjectRepository.getLatestVersion(versions).name
    const isLatestVersion =
      version.current === latestVersion || version.current === 'latest'
    if (isLatestVersion) {
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

  // Keep compatibility with encoded page path
  useEffect(() => {
    updateUrl(version.current, hideUi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadingFailed) {
    return <NotFound />
  }

  if (versions == null) {
    return <LoadingPage />
  }

  if (iframePageNotFound) {
    return (
      <IframeNotFound
        project={project.current}
        version={version.current}
        hideUi={hideUi}
      />
    )
  }

  return (
    <>
      <IFrame
        src={iFrameSrc}
        onPageChanged={onIFramePageChanged}
        onHashChanged={onIFrameHashChanged}
        onTitleChanged={updateTitle}
        onNotFound={onIFrameNotFound}
        onFaviconChanged={onIFrameFaviconChanged}
      />
      {!hideUi && (
        <DocumentControlButtons
          version={version.current}
          versions={versions}
          onVersionChange={onVersionChanged}
        />
      )}
    </>
  )
}
