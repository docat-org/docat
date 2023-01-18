import { TextField } from '@mui/material'
import { Link } from 'react-router-dom'
import React from 'react'
import styles from '../style/components/SearchBar.module.css'
import { Search } from '@mui/icons-material'

export default function SearchBar(): JSX.Element {
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  const navigateToSearchPage = (): void => {
    if (linkRef.current != null) {
      linkRef.current.click()
    }
  }

  return (
    <>
      <Search className={styles['search-icon']} onClick={navigateToSearchPage} />
      <div className={styles['search-bar']}>
        <TextField
          label="Search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigateToSearchPage()
            }
          }}
          variant="standard"
        ></TextField>
      </div>

      <Link ref={linkRef} to={`/search?query=${searchQuery}`} />
    </>
  )
}
