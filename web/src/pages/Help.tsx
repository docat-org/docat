import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

// @ts-expect-error ts can't read symbols from a md file
import gettingStarted from './../assets/getting-started.md'

import UploadButton from '../components/UploadButton'
import Header from '../components/Header'
import LoadingPage from './LoadingPage'

import styles from './../style/pages/Help.module.css'

export default function Help (): JSX.Element {
  document.title = 'Help | docat'

  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  /**
   * Replaces the links to "http://localhost:3000" with the current url of the page
   * @param text the contents of the markdown file
   * @returns the contents of the markdown file with the links replaced
   */
  const replaceLinks = (text: string): string => {
    const protocol = document.location.protocol
    const host = document.location.hostname
    const port =
      document.location.port !== '' ? `:${document.location.port}` : ''

    const currentUrl = `${protocol}//${host}${port}`

    return text.replaceAll('http://localhost:8000', currentUrl)
  }

  // Load the markdown file
  useEffect(() => {
    void (async (): Promise<void> => {
      try {
        // the import "gettingStarted" is just a path to the md file,
        // so we need to fetch the contents of the file manually

        const response = await fetch(gettingStarted as RequestInfo)
        const text = await response.text()
        const content = replaceLinks(text)
        setContent(content)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <>
      <Header />
      <ReactMarkdown className={styles['markdown-container']}>
        {content}
      </ReactMarkdown>
      <UploadButton isSingleButton={true} />
    </>
  )
}
