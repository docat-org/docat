import { TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { ApiSearchResponse } from '../models/SearchResult'
import ProjectRepository from '../repositories/ProjectRepository'
import LoadingPage from './LoadingPage'
import { debounce, uniqueId } from 'lodash'

import styles from '../style/pages/Search.module.css'

export default function Search (): JSX.Element {
  const NO_RESULTS: ApiSearchResponse = {
    projects: [],
    versions: [],
    files: []
  }
  const queryParam =
    useSearchParams()[0].get('query') ?? ''

  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>(queryParam)
  const [results, setResults] = useState<ApiSearchResponse>(NO_RESULTS)
  // used to prevent the search from being triggered immediately when the query is changed
  const [displayedSearchQuery, setDisplayedSearchQuery] =
    useState<string>(queryParam)

  document.title = 'Search | docat'

  const searchDebounced = useMemo(
    () =>
      debounce((): void => {
        if (searchQuery.trim().length === 0) {
          setResults(NO_RESULTS)
          return
        }

        ProjectRepository.search(searchQuery)
          .then((res) => {
            setResults(res)
          })
          .catch((e: { message: string }) => {
            console.error(e)
            setResults(NO_RESULTS)
            setErrorMsg(e.message)
          })
          .finally(() => {
            setLoading(false)
            setTimeout(() => setErrorMsg(null), 5000)
          })
      }, 500),
    [searchQuery]
  )

  useEffect(() => {
    searchDebounced.cancel()
    window.history.pushState({}, '', `/#/search?query=${searchQuery}`)
    searchDebounced()
  }, [searchQuery])

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

  const highlighedText = (text: string): string => {
    text = escapeHtml(text)
    return text.replaceAll(
      searchQuery,
      `<span class="${
        styles.highlighted
      }" key="highlighted-${uniqueId()}">${searchQuery}</span>`
    )
  }

  const hasProjects = (): boolean => {
    return (
      results.projects.length > 0 ||
      results.versions.length > 0 ||
      results.files.length > 0
    )
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <PageLayout
      title="Search"
      description="Search for a project, version, tag, document or html content"
      errorMsg={errorMsg ?? undefined}
    >
      <TextField
        focused={true}
        label="Search"
        type="search"
        value={displayedSearchQuery}
        onChange={(e) => {
          setDisplayedSearchQuery(e.target.value)
          debounce(() => setSearchQuery(e.target.value), 500)()
        }}
      />

      <>
        {hasProjects() && (
          <div className={styles['search-results']}>
            {results.projects.map((p) => (
              <Link
                className={styles['search-result']}
                key={`project-${p.name}`}
                to={`/${p.name}`}
                dangerouslySetInnerHTML={{
                  __html: highlighedText(p.name)
                }}
              ></Link>
            ))}
            {results.versions.map((v) => (
              <Link
                className={styles['search-result']}
                key={`version-${v.project}-${v.version}`}
                to={`/${v.project}/${v.version}`}
                dangerouslySetInnerHTML={{
                  __html: highlighedText(`${v.project} v. ${v.version}`)
                }}
              ></Link>
            ))}
            {results.files.map((f) => (
              <Link
                className={styles['search-result']}
                key={`file-${f.project}-${f.version}-${f.path}`}
                to={`/${f.project}/${f.version}/${f.path}`}
                dangerouslySetInnerHTML={{
                  __html: highlighedText(
                    `${f.project} v. ${f.version} - ${f.path}`
                  )
                }}
              ></Link>
            ))}
          </div>
        )}
        {!hasProjects() && searchQuery.trim().length > 0 && (
          <div className={styles['no-results']}>
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
        {!hasProjects() && searchQuery.trim().length === 0 && (
          <div className={styles['no-results']}>No results</div>
        )}
      </>
    </PageLayout>
  )
}
