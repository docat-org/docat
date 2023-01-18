import semver from 'semver'
import ProjectDetails from '../models/ProjectDetails'
import { Project } from '../models/ProjectsResponse'
import { ApiSearchResponse } from '../models/SearchResult'

const RESOURCE = 'doc'

function filterHiddenVersions (allProjects: Project[]): Project[] {
  // create deep-copy first
  const projects = JSON.parse(JSON.stringify(allProjects)) as Project[]

  projects.forEach(p => {
    p.versions = p.versions.filter(v => !v.hidden)
  })

  return projects.filter(p => p.versions.length > 0)
}

/**
 * Returns a list of all versions of a project.
 * @param {string} projectName Name of the project
 */
async function getVersions (projectName: string): Promise<ProjectDetails[]> {
  const res = await fetch(`${getURLPrefix()}/api/projects/${projectName}?include_hidden=true`)

  if (!res.ok) {
    console.error((await res.json() as { message: string }).message)
    return []
  }

  const json = await res.json() as {
    versions: ProjectDetails[]
  }

  return json.versions
}

/**
 *
 * @param query Query to search for
 * @returns
 */
async function search (query: string): Promise<ApiSearchResponse> {
  const response = await fetch(`${getURLPrefix()}/api/search?query=${query}`)

  if (response.ok) {
    return await response.json() as ApiSearchResponse
  }

  switch (response.status) {
    case 504:
      throw new Error('Failed to search: Gateway timeout')
    default:
      throw new Error(`Failed to search: ${(await response.json() as { message: string }).message}`)
  }
}

/**
 * Returns the logo URL of a given project
 * @param {string} projectName Name of the project
 */
function getProjectLogoURL (projectName: string): string {
  return `${getURLPrefix()}/${RESOURCE}/${projectName}/logo`
}

/**
 * Returns the project documentation URL
 * @param {string} projectName Name of the project
 * @param {string} version Version name
 * @param {string?} docsPath Path to the documentation page
 */
function getProjectDocsURL (projectName: string, version: string, docsPath?: string): string {
  return `${getURLPrefix()}/${RESOURCE}/${projectName}/${version}/${docsPath ?? ''}`
}

/**
 * Returns the new URL used on the Docs page
 * @param {string} currentURL Current URL
 * @param {string} project Name of the project
 * @param {string} version Name of the version
 * @param {string} path Path to the documentation page
 * @param {boolean} hideControls Whether to hide the controls
 * @returns {string} New URL
*/
function getDocPageURL (currentURL: string, project: string, version: string, path: string, hideControls: boolean): string {
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  const startOfParams = currentURL.indexOf('#') + 1
  const oldParams = currentURL.slice(startOfParams)
  const newParams = `/${project}/${version}/${path}${hideControls ? '?hide-ui=true' : ''}`

  return currentURL.replace(oldParams, newParams)
}

/**
 * Uploads new project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {FormData} body Data to upload
 */
async function upload (projectName: string, version: string, body: FormData): Promise<void> {
  const resp = await fetch(`${getURLPrefix()}/api/${projectName}/${version}`,
    {
      method: 'POST',
      body
    }
  )

  if (resp.ok) return

  switch (resp.status) {
    case 401:
      throw new Error('Failed to upload documentation: Version already exists')
    case 504:
      throw new Error('Failed to upload documentation: Server unreachable')
    default:
      throw new Error(`Failed to upload documentation: ${(await resp.json() as { message: string }).message}`)
  }
}

/**
 * Claim the project token
 * @param {string} projectName Name of the project
 */
async function claim (projectName: string): Promise<{ token: string }> {
  const resp = await fetch(`${getURLPrefix()}/api/${projectName}/claim`)

  if (resp.ok) {
    const json = await resp.json() as { token: string }
    return json
  }

  switch (resp.status) {
    case 504:
      throw new Error('Failed to claim project: Server unreachable')
    default:
      throw new Error(`Failed to claim project: ${(await resp.json() as { message: string }).message}`)
  }
}

/**
 * Deletes existing project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {string} token Token to authenticate
 */
async function deleteDoc (projectName: string, version: string, token: string): Promise<void> {
  const headers = { 'Docat-Api-Key': token }
  const resp = await fetch(`${getURLPrefix()}/api/${projectName}/${version}`,
    {
      method: 'DELETE',
      headers
    }
  )

  if (resp.ok) return

  switch (resp.status) {
    case 401:
      throw new Error('Failed to delete documentation: Invalid token')
    case 504:
      throw new Error('Failed to delete documentation: Server unreachable')
    default:
      throw new Error(`Failed to delete documentation: ${(await resp.json() as { message: string }).message}`)
  }
}

/**
 * Compare two versions according to semantic version (semver library)
 * Will always consider the version latest as higher version
 *
 * @param {Object} versionA first version to compare
 * @param {string} versionA.name version name
 * @param {string[] | undefined} versionA.tags optional tags for this vertion
 *
 * @param {Object} versionB second version to compare
 * @param {string} versionB.name version name
 * @param {string[] | undefined} versionB.tags optional tags for this vertion
 */
function compareVersions (versionA: { name: string, tags?: string[] }, versionB: { name: string, tags?: string[] }): number {
  if ((versionA.tags ?? []).includes('latest')) {
    return 1
  }

  if ((versionB.tags ?? []).includes('latest')) {
    return -1
  }

  const semverA = semver.coerce(versionA.name)
  const semverB = semver.coerce(versionB.name)

  if ((semverA == null) || (semverB == null)) {
    return versionA.name.localeCompare(versionB.name)
  }

  return semver.compare(semverA, semverB)
}

/**
* Returns boolean indicating if the project name is part of the favorites.
* @param {string} projectName name of the project
* @returns {boolean} - true is project is favorite
*/
function isFavorite (projectName: string): boolean {
  return localStorage.getItem(projectName) === 'favorite'
}

/**
   * Sets favorite preference on project
   * @param {string} projectName
   * @param {boolean} shouldBeFavorite
   */
function setFavorite (projectName: string, shouldBeFavorite: boolean): void {
  if (shouldBeFavorite) {
    localStorage.setItem(projectName, 'favorite')
  } else {
    localStorage.removeItem(projectName)
  }
}

/**
 * Returns the prefix path for the API
 * @returns {string} - prefix path
 */
function getURLPrefix (): string {
  return process.env.REACT_APP_PREFIX_PATH ?? ''
}

const exp = {
  getVersions,
  filterHiddenVersions,
  search,
  getProjectLogoURL,
  getProjectDocsURL,
  getDocPageURL,
  upload,
  claim,
  deleteDoc,
  compareVersions,
  isFavorite,
  setFavorite,
  getURLPrefix
}

export default exp
