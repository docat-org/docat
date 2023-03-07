export interface ProjectSearchResult {
  name: string
}

export interface VersionSearchResult {
  project: string
  version: string
}

export interface SearchResult {
  projects: ProjectSearchResult[]
  versions: VersionSearchResult[]
}
