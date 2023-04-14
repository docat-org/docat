import _ from 'lodash'
import { TextField } from '@mui/material'
import React, { useCallback } from 'react'
import styles from '../style/components/SearchBar.module.css'
import { useSearch } from '../data-providers/SearchProvider'

export default function SearchBar (): JSX.Element {
  const { query, setQuery } = useSearch()
  const [searchQuery, setSearchQuery] = React.useState<string>(query)

  const updateSearchQueryInDataProvider = useCallback(
    _.debounce(
      (query: string): void => {
        setQuery(query)
      }, 500),
    [])

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value)
    updateSearchQueryInDataProvider.cancel()
    updateSearchQueryInDataProvider(e.target.value)
  }

  return (
    <div className={styles['search-bar']}>
      <TextField
        label="Search"
        type="search"
        value={searchQuery}
        onChange={onSearch}
        onKeyDown={(e): void => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setQuery(searchQuery)
          }
        }}
        variant="standard"
      ></TextField>
    </div>
  )
}
