import { TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { ApiSearchResponse } from '../models/SearchResult'
import ProjectRepository from '../repositories/ProjectRepository'
import { debounce } from 'lodash'

import SearchResults from '../components/SearchResults'

export default function Search (): JSX.Element {
  const NO_RESULTS: ApiSearchResponse = {
    projects: [],
    versions: [],
    files: []
  }
  const queryParam =
    useSearchParams()[0].get('query') ?? ''
  const debounceMs = 1000

  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [results, setResults] = useState<ApiSearchResponse>(NO_RESULTS)
  const [searchQuery, setSearchQuery] = useState<string>(queryParam)
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

        setLoading(true)
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
      }, debounceMs),
    [searchQuery]
  )

  useEffect(() => {
    searchDebounced.cancel()
    window.history.pushState({}, '', `/#/search?query=${searchQuery}`)
    searchDebounced()
  }, [searchQuery])

  return (
    <PageLayout
      title="Search"
      description="Search for a project, version, tag, document or html content"
      errorMsg={errorMsg ?? undefined}
      showSearchBar={false}
    >
      <TextField
        focused={true}
        label="Search"
        type="search"
        value={displayedSearchQuery}
        onChange={(e) => {
          setDisplayedSearchQuery(e.target.value)
          debounce(() => setSearchQuery(e.target.value), debounceMs)()
        }}
      />

      <SearchResults searchQuery={searchQuery} loading={loading} results={results} />
    </PageLayout>
  )
}
