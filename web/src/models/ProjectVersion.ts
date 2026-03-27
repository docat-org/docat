export default class ProjectVersion {
  name: string
  hidden: boolean
  timestamp: Date
  tags: string[]

  constructor(name: string, tags: string[], hidden: boolean, timestamp: Date) {
    this.name = name
    this.tags = tags
    this.hidden = hidden
    this.timestamp = timestamp
  }
}

export const isProjectVersionEqual = function (versionA: ProjectVersion | null, versionB: ProjectVersion | null): boolean {
  if (versionA === null || versionB === null) {
    return versionA === versionB
  }
  return versionA.name === versionB.name
        && versionA.hidden === versionB.hidden
        && versionA.timestamp === versionB.timestamp
        && versionA.tags.sort().join(',') === versionB.tags.sort().join(',')
}