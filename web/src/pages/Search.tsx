import { TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useSearchParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useProjects } from '../data-providers/ProjectDataProvider'
import SearchResults from '../components/SearchResults'
import { SearchResult } from '../models/SearchResult'
import ProjectRepository from '../repositories/ProjectRepository'

const NO_RESULTS: SearchResult = {
  projects: [],
  versions: []
}
const debounceMs = 600

export default function Search (): JSX.Element {
  const queryParam = useSearchParams()[0].get('query') ?? ''

  const { projects, loadingFailed } = useProjects()
  const [results, setResults] = useState<SearchResult | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>(queryParam)
  // used to prevent the search from being triggered immediately when the query is changed
  const [displayedSearchQuery, setDisplayedSearchQuery] =
    useState<string>(queryParam)

  document.title = 'Search | docat'

  const searchDebounced = useMemo(
    () =>
      debounce((): void => {
        if (loadingFailed || searchQuery.trim().length === 0) {
          setResults(NO_RESULTS)
          return
        }

        if (projects == null) {
          // projects are not loaded yet, set timeout to try again
          setResults(null)
          return
        }

        setResults(ProjectRepository.search(projects, searchQuery))
      }, debounceMs),
    [searchQuery, projects, loadingFailed]
  )

  useEffect(() => {
    searchDebounced.cancel()
    if (window.location.hash !== `#/search?query=${searchQuery}`) {
      window.history.pushState({}, '', `/#/search?query=${searchQuery}`)
    }
    searchDebounced()
  }, [searchQuery, projects, loadingFailed])

  return (
    <PageLayout
      title="Search"
      description="Search for a project, version or tag."
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
