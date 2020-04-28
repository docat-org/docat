import Repository from '@/repositories/Repository'

export default {

  resource: 'doc',

  /**
  * Get Config
  */
  async getConfig() {
    try {
      const result = await Repository.get(`${Repository.defaults.baseURL}/config.json`)
      return result.data;
    } catch {
      return {}
    }
  },

  /**
   * Returns all projects
   */
  get() {
    return Repository.get(`${Repository.defaults.baseURL}/${this.resource}/`)
  },

  /**
   * Returns the logo URL of a given project
   * @param {string} projectName Name of the project
   */
  getProjectLogoURL(projectName) {
    return `${Repository.defaults.baseURL}/${this.resource}/${projectName}/logo.jpg`
  },

  /**
   * Returns the project documentatino URL
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string?} docsPath Path to the documentation page
   */
  getProjectDocsURL(projectName, version, docsPath) {
    return `${Repository.defaults.baseURL}/${this.resource}/${projectName}/${version}/${docsPath || ''}`
  },

  /**
   * Returns the docs path only without the prefix, porject and version
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string} fullDocsPath Full path to the docs including prefix, project and version
   */
  getDocsPath(projectName, version, fullDocsPath) {
    const match = decodeURIComponent(fullDocsPath).match(new RegExp(
      String.raw`(.*)/${this.resource}/${projectName}/${version}/(.*)`
    ))
    if (match && match.length > 2) {
      return match[2] || ""
    } else {
      return fullDocsPath
    }
  },

  /**
   * Returns information about the Project
   * this includes mainly the existing versions
   * @param {string} projectName Name of the project
   */
  async getVersions(projectName) {
    return (await Repository.get(`${Repository.defaults.baseURL}/${this.resource}/${projectName}/`))
      .data
      .filter((version) => version.type == 'directory')
  },

  /**
   * Upload a new project (as zip)
   * @param {string} projectName Name of the project
   * @param {string} version Version of the project
   * @param {formData} formData Zip archive to upload
   */
  async upload(projectName, version, formData) {
    await Repository.post(
      `${Repository.defaults.baseURL}/api/${projectName}/${version}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
}
