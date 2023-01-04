export interface Project {
  name: string
  logo: boolean
  versions: number
}

export default interface ProjectsResponse {
  projects: Project[]
}
