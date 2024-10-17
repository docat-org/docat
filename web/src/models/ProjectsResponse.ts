import type ProjectDetails from './ProjectDetails'

export interface Project {
  name: string
  logo: boolean
  storage: string
  versions: ProjectDetails[]
}

export default interface ProjectsResponse {
  projects: Project[]
}
