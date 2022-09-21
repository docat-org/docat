
const port = process.env.VUE_APP_BACKEND_PORT || location.port
const host = process.env.VUE_APP_BACKEND_HOST || location.hostname
const semver = require('semver')

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
    const resp = await fetch(`${this.baseURL}/api/projects`)
    return (await resp.json()).projects
  },

  /**
   * Returns the logo URL of a given project
   * @param {string} projectName Name of the project
   */
  getProjectLogoURL(projectName) {
    return `${this.baseURL}/${resource}/${projectName}/logo.png`
  },

  /**
   * Returns the project documentation URL
   * @param {string} projectName Name of the project
   * @param {string} version Version name
   * @param {string?} docsPath Path to the documentation page
   */
  getProjectDocsURL(projectName, version, docsPath) {
    return `${this.baseURL}/${resource}/${projectName}/${version}/${docsPath || ''}`
  },

  /**
   * Returns the docs path only without the prefix, project and version
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
    const resp = await fetch(`${this.baseURL}/api/projects/${projectName}`)
    return (await resp.json()).versions
  },

  /**
   * Uploads new project documentation
   * @param {string} projectName Name of the project
   * @param {string} version Name of the version
   * @param {string} body Data to upload
   */
  async upload(projectName, version, body) {
    const resp = await fetch(`${this.baseURL}/api/${projectName}/${version}`,
      {
        method: 'POST',
        body
      }
    )
    const json = await resp.json()
    if (!resp.ok) {
      throw new Error(json.message)
    }
    return json
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
  async deleteDoc(projectName, version, token) {
    const headers = { "Docat-Api-Key": token }
    const resp = await fetch(`${this.baseURL}/api/${projectName}/${version}`,
      {
        method: 'DELETE',
        headers: headers
      }
    )
    const json = await resp.json()
    if (!resp.ok) {
      throw new Error(json.message)
    }
    return json
  },

  /**
   * Compare two versions according to semantic version (semver library)
   * Will always consider the version latest as higher version
   *
   * @param {Object} versionA first version to compare
   * @param {string} versionA.name version name
   * @param {string[]?} versionA.tags optinoal tags for this vertion
   *
   * @param {Object} versionB second version to compare
   * @param {string} versionB.name version name
   * @param {string[]?} versionB.tags optinoal tags for this vertion
   */
  compareVersions(versionA, versionB) {
      if ((versionA.tags || []).includes('latest')) {
        return 1;
      } else if ((versionB.tags || []).includes('latest')) {
        return -1;
      } else {
          const semverA = semver.coerce(versionA.name);
          const semverB = semver.coerce(versionB.name);
          if (!semverA || !semverB) {
              return versionA.name.localeCompare(versionB.name);
          }
          return semver.compare(semverA, semverB);
      }
   },

   /**
   * Returns boolean indicating if the project name is part of the favourites.
   * @param {string} projectName name of the project
   * @returns bool - true is project is favourite
   */
  isFavourite(projectName) {
    return localStorage.getItem(projectName) == "favourite";
  },

  /**
   * Sets favourite preference on project
   * @param {string} projectName
   * @param {boolean} shouldBeFavourite
   */
  setFavourite(projectName, shouldBeFavourite) {
    if (shouldBeFavourite) {
      localStorage.setItem(projectName, "favourite");
    } else {
      localStorage.removeItem(projectName);
    }
  }
}
