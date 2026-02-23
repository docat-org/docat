import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Divider, IconButton, InputBase, Paper, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../data-providers/SearchProvider';


interface Props {
  showFavourites: boolean
  onShowFavourites: (all: boolean) => void
}

export default function SearchBar(props: Props): JSX.Element {
  const [showFavourites, setShowFavourites] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const { query, setQuery } = useSearch()
  const [searchQuery, setSearchQuery] = React.useState<string>(query)


  const updateSearch = (q: string) => {
    setSearchQuery(q)
    setQuery(q)

    if (q) {
      setSearchParams({q})
    } else {
      setSearchParams({})
    }
  }

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      updateSearch(q)
    }
    setShowFavourites(props.showFavourites)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.showFavourites]);

  const onFavourites = (show: boolean): void => {
    setSearchParams({})
    setSearchQuery("")
    setQuery("")

    setShowFavourites(show)
    props.onShowFavourites(!show)
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setShowFavourites(false)
    updateSearch(e.target.value)
  }

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        maxWidth: 600,
        marginLeft: '16px',
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Docs"
        inputProps={{ 'aria-label': 'search docs' }}
        value={searchQuery}
        onChange={onSearch}
        onKeyDown={(e): void => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setQuery(searchQuery)
          }
        }}

      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <Tooltip title={`Show ${showFavourites ? 'all docs' : 'favourites only'}`} placement="right" arrow>
        <IconButton onClick={() => onFavourites(!showFavourites)} sx={{ p: '10px' }} aria-label="directions">
          { showFavourites  ?  <StarIcon /> : <StarBorderIcon /> }
        </IconButton>
      </Tooltip>
    </Paper>
  )
}
