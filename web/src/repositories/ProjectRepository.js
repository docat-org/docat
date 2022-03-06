
const port = process.env.VUE_APP_BACKEND_PORT || location.port
const host = process.env.VUE_APP_BACKEND_HOST || location.hostname
const semver = require('semver')

export default {

  resource: 'doc',

  baseURL: `${location.protocol}//${host}:${port}`,

  /**
  * Get Config
  */
  async getConfig() {
    try {
      const resp = await fetch(`${this.baseURL}/config.json`)
      return await resp.json();
    } catch {
      return {}
    }
  },

  /**
   * Returns all projects
   */
  async get() {
    const resp = await fetch(`${this.baseURL}/${this.resource}/`)
    return await resp.json()
  },

  /**
   * Returns the logo URL of a given project
   * @param {string} projectName Name of the project
   */
  getProjectLogoURL(projectName) {
    return `${this.baseURL}/${this.resource}/${projectName}/logo.jpg`
  },

  /**
   * Returns the project documentatino URL
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string?} docsPath Path to the documentation page
   */
  getProjectDocsURL(projectName, version, docsPath, resource) {
    return `${this.baseURL}/${resource || this.resource}/${projectName}/${version}/${docsPath || ''}`
  },

  /**
   * Returns the docs path only without the prefix, porject and version
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string} fullDocsPath Full path to the docs including prefix, project and version
   */
  getDocsPath(projectName, version, fullDocsPath) {
    let escapedProjectName = projectName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    let escapedVersion = version.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    const match = decodeURIComponent(fullDocsPath).match(new RegExp(
      `(?<=${escapedProjectName}/${escapedVersion}/)(.*)`
    ))
    if (match && match.length > 0) {
      return match[0] || ""
    } else {
      return ""
    }
  },

  /**
   * Returns information about the Project
   * this includes mainly the existing versions
   * @param {string} projectName Name of the project
   */
  async getVersions(projectName) {
    const resp = await fetch(`${this.baseURL}/${this.resource}/${projectName}/`)
    return (await resp.json())
      .filter((version) => version.type == 'directory')
  },

  /**
   * Uploads new project documentation
   * @param {string} projectName Name of the project
   * @param {string} version Name of the version
   * @param {string} body Data to upload
   */
  async upload(projectName, version, body) {
    await fetch(`${this.baseURL}/api/${projectName}/${version}`,
      {
        method: 'POST',
        body
      }
    )
  },

  /**
   * Claim the project token
   * @param {string} projectName Name of the project
   */
  async claim(projectName) {
    const resp = await fetch(`${this.baseURL}/api/${projectName}/claim`)
    const json = await resp.json()
    if (!resp.ok) {
      throw new Error(json.message)
    }
    return json
  },

  /**
   * Deletes existing project documentation
   * @param {string} projectName Name of the project
   * @param {string} version Name of the version
   */
  async delete_doc(projectName, version, token) {
    const headers = { "Docat-Api-Key": token }
    await fetch(`${this.baseURL}/api/${projectName}/${version}`,
      {
        method: 'DELETE',
        headers: headers
      }
    )
  },

  /**
   * Compare two versions according to semantic version (semver library)
   * Will always consider the version latest as higher version
   * 
   * @param {string} versionNameA Name of the version one
   * @param {string} versionNameB Name of the version two
   */
  compareVersions(versionNameA, versionNameB) {
  if (versionNameA == "latest") return 1;
      else if (versionNameB == "latest") return -1;
      else {
          const versionA = semver.coerce(versionNameA);
          const versionB = semver.coerce(versionNameB);
          if (!versionA || !versionB) {
              return versionNameA.localeCompare(versionNameB);
          }
          return semver.compare(versionA, versionB);
      }
   },
}
