export default class ProjectDetails {
  name: string
  hidden: boolean
  upload_date: Date
  tags: string[]

  constructor(name: string, tags: string[], hidden: boolean, upload_date: string) {
    this.name = name
    this.tags = tags
    this.hidden = hidden
    this.upload_date = new Date(upload_date) // new Date(Date.parse(upload_date))
  }
}
