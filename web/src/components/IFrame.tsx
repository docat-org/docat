import React, { useRef } from 'react'
import { uniqueId } from 'lodash'

import styles from '../style/components/IFrame.module.css'
interface Props {
  src: string
  onPageChanged: (page: string, hash: string, title?: string) => void
  onHashChanged: (hash: string) => void
  onTitleChanged: (title: string) => void
  onNotFound: () => void
  onFaviconChanged?: (faviconUrl: string | null) => void
}

export default function IFrame(props: Props): JSX.Element {
  const iFrameRef = useRef<HTMLIFrameElement>(null)

  const onIframeLoad = (): void => {
    if (iFrameRef.current === null) {
      console.error('iFrameRef is null')
      return
    }

    // remove the event listeners to prevent memory leaks
    iFrameRef.current.contentWindow?.removeEventListener(
      'hashchange',
      hashChangeEventListener
    )
    iFrameRef.current.contentWindow?.removeEventListener(
      'titlechange',
      titleChangeEventListener
    )

    const url = iFrameRef.current?.contentDocument?.location.href
    if (url == null) {
      console.warn('IFrame onload event triggered, but url is null')
      return
    }

    // make all external links in iframe open in new tab
    // and make internal links replace the iframe url so that change
    // doesn't show up in the page history (we'd need to click back twice)
    iFrameRef.current.contentDocument
      ?.querySelectorAll('a')
      .forEach((a: HTMLAnchorElement) => {
        if (typeof a.href === 'string' && !a.href.startsWith(window.location.origin)) {
          a.setAttribute('target', '_blank')
          return
        }

        const href = a.getAttribute('href') ?? ''
        if (href.trim() === '') {
          // ignore empty links, may be handled with js internally.
          // Will inevitably cause the user to have to click back
          // multiple times to get back to the previous page.
          return
        }

        // From here: https://www.ozzu.com/questions/358584/how-do-you-ignore-iframes-javascript-history
        a.onclick = () => {
          iFrameRef.current?.contentWindow?.location.replace(a.href)
          return false
        }
      })

    // React to page 404ing
    void (async (): Promise<void> => {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.status === 404) {
        props.onNotFound()
      }
    })()

    // Add the event listener again
    iFrameRef.current.contentWindow?.addEventListener(
      'hashchange',
      hashChangeEventListener
    )
    iFrameRef.current.contentWindow?.addEventListener(
      'titlechange',
      titleChangeEventListener
    )

    const parts = url.split('/doc/').slice(1).join('/doc/').split('/')
    const urlPageAndHash = parts.slice(2).join('/')
    const hashIndex = urlPageAndHash.includes('#')
      ? urlPageAndHash.indexOf('#')
      : urlPageAndHash.length
    const urlPage = urlPageAndHash.slice(0, hashIndex)
    const urlHash = urlPageAndHash.slice(hashIndex)
    const title = iFrameRef.current?.contentDocument?.title

    props.onPageChanged(urlPage, urlHash, title)

    const favicon = extractFaviconUrl(iFrameRef.current.contentDocument)
    props.onFaviconChanged?.(favicon)
  }

  const extractFaviconUrl = (doc: Document | null | undefined): string | null => {
    if (doc == null) {
      return null
    }

    let link = doc.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (!link?.href) {
      return null
    }

    return link.href
  }

  const hashChangeEventListener = (): void => {
    if (iFrameRef.current === null) {
      console.error('hashChangeEvent from iframe but iFrameRef is null')
      return
    }

    const url = iFrameRef.current?.contentDocument?.location.href
    if (url == null) {
      return
    }

    let hash = url.split('#')[1]
    if (hash !== null) {
      hash = `#${hash}`
    } else {
      hash = ''
    }

    props.onHashChanged(hash)
  }

  const titleChangeEventListener = (): void => {
    if (iFrameRef.current === null) {
      console.error('titleChangeEvent from iframe but iFrameRef is null')
      return
    }

    const title = iFrameRef.current?.contentDocument?.title
    if (title == null) {
      return
    }

    props.onTitleChanged(title)
  }

  return (
    <iframe
      ref={iFrameRef}
      key={uniqueId()}
      className={styles['docs-iframe']}
      src={props.src}
      title="docs"
      onLoad={onIframeLoad}
    />
  )
}
