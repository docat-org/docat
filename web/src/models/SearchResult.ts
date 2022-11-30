export interface ProjectSearchResult {
  name: string
}

export interface VersionSearchResult {
  project: string
  version: string
}

export interface FileSearchResult {
  project: string
  version: string
  path: string
}

export interface ApiSearchResponse {
  projects: ProjectSearchResult[]
  versions: VersionSearchResult[]
  files: FileSearchResult[]
}
