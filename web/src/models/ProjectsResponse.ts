export interface Project {
  name: string
  versions: number
}

export default interface ProjectsResponse {
  projects: Project[]
}
