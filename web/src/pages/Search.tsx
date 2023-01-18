import { TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { ApiSearchResponse } from '../models/SearchResult'
import ProjectRepository from '../repositories/ProjectRepository'
import { debounce } from 'lodash'

import SearchResults from '../components/SearchResults'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'

const NO_RESULTS: ApiSearchResponse = {
  projects: [],
  versions: [],
  files: []
}
const debounceMs = 600

export default function Search(): JSX.Element {
  const queryParam = useSearchParams()[0].get('query') ?? ''

  const { showMessage } = useMessageBanner()
  const [results, setResults] = useState<ApiSearchResponse | null>(null)
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

        void (async () => {
          try {
            const results = await ProjectRepository.search(searchQuery)
            setResults(results)
          } catch (e) {
            console.error(e)
            setResults(NO_RESULTS)
            showMessage({
              text: (e as { message: string }).message,
              type: 'error'
            })
          }
        })()
      }, debounceMs),
    [searchQuery]
  )

  useEffect(() => {
    searchDebounced.cancel()
    window.history.pushState({}, '', `${ProjectRepository.getURLPrefix()}/#/search?query=${searchQuery}`)
    searchDebounced()
  }, [searchQuery])

  return (
    <PageLayout
      title="Search"
      description="Search for a project, version, tag, document or html content"
      showSearchBar={false}
    >
      <TextField
        autoFocus
        label="Search"
        type="search"
        value={displayedSearchQuery}
        onChange={(e) => {
          setDisplayedSearchQuery(e.target.value)
          debounce(() => setSearchQuery(e.target.value), debounceMs)()
        }}
      />
      {results === null
        ? (
        <div className="loading-spinner" />
          )
        : (
        <SearchResults searchQuery={searchQuery} results={results} />
          )}
    </PageLayout>
  )
}
