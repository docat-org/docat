/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
/*
  We need any, because we don't know the type of the children,
  and we need the return those children again which is an "unsafe return"
*/

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type Project } from '../models/ProjectsResponse'
import { useProjects } from './ProjectDataProvider'
import Fuse from 'fuse.js'

interface SearchState {
  filteredProjects: Project[] | null
  query: string
  setQuery: (query: string) => void
}

const Context = createContext<SearchState>({
  filteredProjects: null,
  query: '',
  setQuery: (): void => {
    console.warn('SearchDataProvider not initialized')
  }
})

export function SearchProvider ({ children }: any): JSX.Element {
  const { projects } = useProjects()

  const filterProjects = (query: string): Project[] | null => {
    if (projects == null) {
      return null
    }

    if (query.trim() === '') {
      return projects
    }

    const fuse = new Fuse(projects, {
      keys: ['name'],
      includeScore: true
    })

    // sort by match score
    return fuse
      .search(query)
      .sort((x, y) => (x.score ?? 0) - (y.score ?? 0))
      .map((result) => result.item)
  }

  const setQuery = (query: string): void => {
    setState({
      query,
      filteredProjects: filterProjects(query),
      setQuery
    })
  }

  const [state, setState] = useState<SearchState>({
    filteredProjects: null,
    query: '',
    setQuery
  })

  useEffect(() => {
    setState({
      query: '',
      filteredProjects: filterProjects(''),
      setQuery
    })
  }, [projects])

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useSearch = (): SearchState => useContext(Context)
