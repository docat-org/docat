import { debounce, uniqueId } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiSearchResponse } from '../models/SearchResult'

import styles from '../style/components/SearchResults.module.css'

interface Props {
  searchQuery: string
  results: ApiSearchResponse
}

export default function SearchResults(props: Props): JSX.Element {
  const [resultElements, setResultElements] = useState<JSX.Element[]>([])

  useEffect(() => {
    searchResultElements.cancel()
    searchResultElements()
  }, [props.results])

  /**
   * Used to create the result elements before updating the UI,
   * as this can lag if there are many results.
   * @param res ApiSearchResponse
   * @returns Array of JSX.Element
   */
  const searchResultElements = useMemo(
    () =>
      debounce(() => {
        const projects = props.results.projects.map((p) => (
          <Link
            className={styles['search-result']}
            key={`project-${p.name}`}
            to={`/${p.name}`}
            dangerouslySetInnerHTML={{
              __html: highlighedText(p.name)
            }}
          ></Link>
        ))

        const versions = props.results.versions.map((v) => (
          <Link
            className={styles['search-result']}
            key={`version-${v.project}-${v.version}`}
            to={`/${v.project}/${v.version}`}
            dangerouslySetInnerHTML={{
              __html: highlighedText(`${v.project} v. ${v.version}`)
            }}
          ></Link>
        ))

        const files = props.results.files.map((f) => (
          <Link
            className={styles['search-result']}
            key={`file-${f.project}-${f.version}-${f.path}`}
            to={`/${f.project}/${f.version}/${f.path}`}
            dangerouslySetInnerHTML={{
              __html: highlighedText(`${f.project} v. ${f.version} - ${f.path}`)
            }}
          ></Link>
        ))

        setResultElements([...projects, ...versions, ...files])
      }, 1000),
    [props.results]
  )

  /**
   * Used to replace any unsafe characters in the displayed name
   * with their html counterparts because we need to set the text as
   * html to be able to highlight the search query.
   * @param text content to be escaped
   * @returns excaped text
   */
  const escapeHtml = (text: string): string => {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  /**
   * Used to highlight the query in the displayed link text.
   * @param text link text
   * @returns html string with highlighted query
   */
  const highlighedText = (text: string): string => {
    text = escapeHtml(text)
    return text.replaceAll(
      props.searchQuery,
      `<span class="${styles.highlighted}" key="highlighted-${uniqueId()}">${
        props.searchQuery
      }</span>`
    )
  }

  if (resultElements.length === 0) {
    if (
      props.results.projects.length > 0 ||
      props.results.versions.length > 0 ||
      props.results.files.length > 0
    ) {
      return <div className="loading-spinner" />
    }

    if (props.searchQuery.trim().length === 0) {
      return <div className={styles['no-results']}>No results</div>
    }
    return (
      <div className={styles['no-results']}>
        No results for &quot;{props.searchQuery}&quot;
      </div>
    )
  }

  return <div className={styles['search-results']}>{resultElements}</div>
}
