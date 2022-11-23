import React, { createContext, useContext, useEffect, useState } from 'react'

interface ProjectState {
  projects: string[] | null
  loadingFailed: boolean
}

const Context = createContext<ProjectState>({
  projects: null,
  loadingFailed: false
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProjectDataProvider ({ children }: any): JSX.Element {
  const [projects, setProjects] = useState<ProjectState>({
    projects: null,
    loadingFailed: false
  })

  useEffect(() => {
    fetch('/api/projects')
      .then(async (res) => {
        if (!res.ok) {
          console.error(`Failed to load projects, status code: ${res.status}`)
          return { projects: null }
        }

        return await res.json() as { projects: string[] }
      })
      .then((data) => {
        if (data.projects != null) {
          setProjects({ projects: data.projects, loadingFailed: false })
        } else {
          setProjects({ projects: null, loadingFailed: true })
        }
      })
      .catch((err) => {
        console.error(err)
        setProjects({ projects: null, loadingFailed: true })
      })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return <Context.Provider value={projects}>{children}</Context.Provider>
}

export const useProjects = (): ProjectState => useContext(Context)
