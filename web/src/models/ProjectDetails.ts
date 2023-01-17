export default class ProjectDetails {
  name: string
  hidden: boolean
  tags: string[]

  constructor(name: string, tags: string[], hidden: boolean) {
    this.name = name
    this.tags = tags
    this.hidden = hidden
  }
}
