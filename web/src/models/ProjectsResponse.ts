import type ProjectVersion from './ProjectVersion'

export interface Project {
  name: string
  logo: boolean
  storage: string
  versions: ProjectVersion[]
}

export default interface ProjectsResponse {
  projects: Project[]
}
