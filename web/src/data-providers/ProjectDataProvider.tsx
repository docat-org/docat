import React, { createContext, useContext, useEffect, useState } from 'react'

interface ProjectState {
  projects: string[] | null
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProjectDataProvider ({ children }: any): JSX.Element {
  const loadData = (): void => {
    fetch('/api/projects')
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Failed to load projects, status code: ${res.status}`)
          return { projects: null }
        }

        return (await res.json()) as { projects: string[] }
      })
      .then((data) => {
        if (data.projects != null) {
          setProjects({
            projects: data.projects,
            loadingFailed: false,
            reload: loadData
          })
        } else {
          setProjects({ projects: null, loadingFailed: true, reload: loadData })
        }
      })
      .catch((err) => {
        console.error(err)
        setProjects({ projects: null, loadingFailed: true, reload: loadData })
      })
  }

  const [projects, setProjects] = useState<ProjectState>({
    projects: null,
    loadingFailed: false,
    reload: loadData
  })

  useEffect(() => {
    loadData()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return <Context.Provider value={projects}>{children}</Context.Provider>
}

export const useProjects = (): ProjectState => useContext(Context)
