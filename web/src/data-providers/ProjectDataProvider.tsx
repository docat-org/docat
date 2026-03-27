/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  We need any, because we don't know the type of the children
*/

import { createContext, useContext, useEffect, useRef, useState, JSX } from 'react'
import { type Project } from '../models/ProjectsResponse'
import type ProjectsResponse from '../models/ProjectsResponse'
import { useMessageBanner } from './MessageBannerProvider'
import { useConfig } from './ConfigDataProvider'
import ProjectRepository from '../repositories/ProjectRepository'

interface ProjectState {
  projects: Project[] | null
  loadingFailed: boolean
}

interface ProjectContext {
  state: ProjectState
  reload: () => Promise<void>
}

const Context = createContext<ProjectContext>({
  state: {
    projects: null,
    loadingFailed: false
  },
  reload: async (): Promise<void> => {
    console.warn('ProjectDataProvider not initialized')
  }
})


enum LoadTrigger {
  INITIAL_LOAD,
  REQUESTED_RELOAD,
  INTERVAL
}

/**
 * Provides the projects for the whole application,
 * so that it can be used in every component without it being reloaded
 * the whole time or having to be passed down.
 *
 * If reloading is required, call the reload function.
 */
export function ProjectDataProvider({ children }: any): JSX.Element {
  const { showMessage } = useMessageBanner()
  const { reloadIntervalSeconds } = useConfig()
  const reloadRef = useRef<{reload: (loadTrigger: LoadTrigger) => Promise<void>}>({
    reload: async () => {
      console.warn('ProjectDataProvider not initialized')
    }
  })
  const intervalRef = useRef<number | null>(null)

  const [state, setState] = useState<ProjectState>({
    projects: null,
    loadingFailed: false,
  })

  useEffect(() => {
    reloadRef.current.reload = async (loadTrigger: LoadTrigger): Promise<void> => {
      try {
        const response = await fetch('/api/projects?include_hidden=true')

        if (!response.ok) {
          if (loadTrigger === LoadTrigger.INTERVAL) {
            return
          }
          throw new Error(
            `Failed to load projects, status code: ${response.status}`
          )
        }

        const data: ProjectsResponse = await response.json()
        const orderedProjects = data.projects.sort((a, b) => a.name.localeCompare(b.name))
        if (ProjectRepository.isProjectListEqual(state.projects, orderedProjects)) {
          return
        }
        setState({
          projects: orderedProjects,
          loadingFailed: false
        })
      } catch (e) {
        console.error(e)

        showMessage({
          content: 'Failed to load projects',
          type: 'error',
          showMs: 6000
        })

        setState({
          projects: null,
          loadingFailed: true
        })
      }
    }
  }, [showMessage, state.projects])

  useEffect(() => {
    reloadRef.current.reload(LoadTrigger.INITIAL_LOAD)
    if (reloadIntervalSeconds) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval((actions: any) => { actions.current.reload(LoadTrigger.INTERVAL) }, reloadIntervalSeconds * 1000, reloadRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Context.Provider value={{ state: state, reload: async () => await reloadRef.current.reload(LoadTrigger.REQUESTED_RELOAD) }}>{children}</Context.Provider>
}

export const useProjects = (): ProjectContext => useContext(Context)
