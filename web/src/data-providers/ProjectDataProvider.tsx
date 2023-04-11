/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
/*
  We need any, because we don't know the type of the children,
  and we need the return those children again which is an "unsafe return"
*/

import React, { createContext, useContext, useEffect, useState } from 'react'
import ProjectsResponse, { Project } from '../models/ProjectsResponse'
import { useMessageBanner } from './MessageBannerProvider'

interface ProjectState {
  projects: Project[] | null
  loadingFailed: boolean
  reload: () => void
}

const Context = createContext<ProjectState>({
  projects: null,
  loadingFailed: false,
  reload: (): void => {
    console.warn('ProjectDataProvider not initialized')
  }
})

/**
 * Provides the projects for the whole application,
 * so that it can be used in every component without it being reloaded
 * the whole time or having to be passed down.
 *
 * If reloading is required, call the reload function.
 */
export function ProjectDataProvider ({ children }: any): JSX.Element {
  const { showMessage } = useMessageBanner()

  const loadData = (): void => {
    void (async (): Promise<void> => {
      try {
        const response = await fetch('/api/projects?include_hidden=true')

        if (!response.ok) {
          throw new Error(
            `Failed to load projects, status code: ${response.status}`
          )
        }

        const data: ProjectsResponse = await response.json()
        setState({
          projects: data.projects,
          loadingFailed: false,
          reload: loadData
        })
      } catch (e) {
        console.error(e)

        showMessage({
          text: 'Failed to load projects',
          type: 'error'
        })

        setState({
          projects: null,
          loadingFailed: true,
          reload: loadData
        })
      }
    })()
  }

  const [state, setState] = useState<ProjectState>({
    projects: null,
    loadingFailed: false,
    reload: loadData
  })

  useEffect(() => {
    loadData()
  }, [])

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useProjects = (): ProjectState => useContext(Context)
