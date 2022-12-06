import { TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import styles from '../style/components/SearchBar.module.css'

export default function SearchBar (): JSX.Element {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  return (
    <div className={styles['search-bar']}>
      <TextField
        label="Search"
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigate(`/search?query=${searchQuery}`)
          }
        }}
        variant="standard"
      ></TextField>
    </div>
  )
}
