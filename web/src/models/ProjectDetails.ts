export default class ProjectDetails {
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
