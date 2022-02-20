
const port = process.env.VUE_APP_BACKEND_PORT || location.port
const host = process.env.VUE_APP_BACKEND_HOST || location.hostname

const resource = 'doc'
export default {

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
    const resp = await fetch(`${this.baseURL}/${resource}/`)
    return await resp.json()
  },

  /**
   * Returns the logo URL of a given project
   * @param {string} projectName Name of the project
   */
  getProjectLogoURL(projectName) {
    return `${this.baseURL}/${resource}/${projectName}/logo.jpg`
  },

  /**
   * Returns the project documentatino URL
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string?} docsPath Path to the documentation page
   */
  getProjectDocsURL(projectName, version, docsPath) {
    return `${this.baseURL}/${resource}/${projectName}/${version}/${docsPath || ''}`
  },

  /**
   * Returns the docs path only without the prefix, porject and version
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string} fullDocsPath Full path to the docs including prefix, project and version
   */
  getDocsPath(projectName, version, fullDocsPath) {
    const match = decodeURIComponent(fullDocsPath).match(new RegExp(
      String.raw`(.*)/${resource}/${projectName}/${version}/(.*)`
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
    const resp = await fetch(`${this.baseURL}/${resource}/${projectName}/`)
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
   * Compare two versions according to semantic version
   * Will always consider the version latest as higher version
   * Limited support of mixed letters with digits. 
   * 
   * @param {string} version_name_a Name of the version one
   * @param {string} version_name_b Name of the version two
   */
   compareVersions(version_name_a, version_name_b) {
    // Trying to separate the version into version levels (digits or letters) separated by .
    if (version_name_a.includes(".") && version_name_b.includes(".")) {
      const a_levels = version_name_a.split(".")
      const b_levels = version_name_b.split(".")
      for (var i = 0; i < a_levels.length; ++i) {
        if (i < b_levels.length) {
          var level_a = a_levels[i]
          var level_b = b_levels[i]
          if (level_a != level_b) {
            let a_number = parseInt(level_a)
            let b_number = parseInt(level_b)
            if (isNaN(a_number) || isNaN(b_number)) {
              return level_a > level_b ? 1 : -1;
            } else {
              return a_number > b_number ? 1 : -1;
            }
          }
        } else {
          // The a version is longer, it should be the higher version
          return 1;
        }
      }
      // The b version is longer, it should be the higher version
      return -1;
    } else if (version_name_a.includes(".")) {
      // If no meaningful point separation on one of the version, then r 
      return -1;
    } else if (version_name_b.includes(".")) {
      return 1;
    } else if (version_name_a == "latest") {
      // If both version have no meaningful point separation, just apply string comparison, unless one version is "latest"
      return 1;
    } else if (version_name_b == "latest") {
      return -1;
    } else {
      return (version_name_a > version_name_b) ? 1 : -1;
    }
  },
}
