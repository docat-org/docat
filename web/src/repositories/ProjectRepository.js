import Repository from '@/repositories/Repository'

const resource = '/doc'
export default {

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
   * Returns information about the Project
   * this includes mainly the existing versions
   * @param {string} projectName Name of the project
   */
  getVersions(projectName) {
    return Repository.get(`${Repository.defaults.baseURL}/${resource}/${projectName}/`)
  }
}
