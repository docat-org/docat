import Repository from '@/repositories/Repository'

const resource = 'doc'
export default {

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
    return Repository.get(`${Repository.defaults.baseURL}/${resource}/`)
  },

  /**
   * Returns the logo URL of a given project
   * @param {string} projectName Name of the project
   */
  getProjectLogoURL(projectName) {
    return `${Repository.defaults.baseURL}/${resource}/${projectName}/logo.jpg`
  },

  /**
   * Returns the project documentatino URL
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   */
  getProjectDocsURL(projectName, version) {
    return `${Repository.defaults.baseURL}/${resource}/${projectName}/${version}/`
  },

  /**
   * Returns information about the Project
   * this includes mainly the existing versions
   * @param {string} projectName Name of the project
   */
  async getVersions(projectName) {
    return (await Repository.get(`${Repository.defaults.baseURL}/${resource}/${projectName}/`))
      .data
      .filter((version) => version.type == 'directory')
  },

  async upload(projectName, version, formData) {
    await Repository.post(
      `${Repository.defaults.baseURL}/api/${projectName}/${version}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
}
