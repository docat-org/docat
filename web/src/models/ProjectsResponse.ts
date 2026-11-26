import type ProjectDetails from './ProjectDetails'

export interface Project {
  name: string
  logo: boolean
  versions: ProjectDetails[]
}

export default interface ProjectsResponse {
  projects: Project[]
}
