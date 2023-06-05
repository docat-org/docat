import semver from 'semver'
import ProjectDetails from '../models/ProjectDetails'
import { Project } from '../models/ProjectsResponse'

const RESOURCE = 'doc'

/**
 * Escapes all slashes in a url to the docs page from the point between the version and the path.
 * This is necessary because react-router thinks that the slashes are path separators.
 * The slashes are escaped to %2F and reverted back to slashes by react-router.
 * Example:
 *  /doc/project/1.0.0/path/to/page -> /doc/project/1.0.0/path%2Fto%2Fpage
 * @param pathname useLocation().pathname
 * @param search useLocation().search
 * @param hash useLocation().hash
 * @returns a url with escaped slashes
 */
function escapeSlashesInUrl (pathname: string, search: string, hash: string): string {
  const url = pathname + hash + search
  const projectAndVersion = url.split('/', 3).join('/')
  let path = url.substring(projectAndVersion.length + 1)
  path = path.replaceAll('/', '%2F')

  if (path.length === 0) {
    return projectAndVersion
  }

  return projectAndVersion + '/' + path
}

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
  const res = await fetch(`/api/projects/${projectName}?include_hidden=true`)

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
 * Returns the latest version of a project.
 * Order of precedence: latest, latest tag, latest version
 * @param versions all versions of a project
 */
function getLatestVersion (versions: ProjectDetails[]): ProjectDetails {
  const latest = versions.find((v) => v.name.includes('latest'))
  if (latest != null) {
    return latest
  }

  const latestTag = versions.find((v) => v.tags.includes('latest'))
  if (latestTag != null) {
    return latestTag
  }

  const sortedVersions = versions
    .sort((a, b) => compareVersions(a, b))

  return sortedVersions[sortedVersions.length - 1]
}

/**
 * Returns the logo URL of a given project
 * @param {string} projectName Name of the project
 */
function getProjectLogoURL (projectName: string): string {
  return `/${RESOURCE}/${projectName}/logo`
}

/**
 * Returns the project documentation URL
 * @param {string} projectName Name of the project
 * @param {string} version Version name
 * @param {string?} docsPath Path to the documentation page
 * @param {string?} hash Hash part of the url (html id)
 */
function getProjectDocsURL (projectName: string, version: string, docsPath?: string, hash?: string): string {
  return `/${RESOURCE}/${projectName}/${version}/${docsPath ?? ''}${hash ?? ''}`
}

/**
 * Uploads new project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {FormData} body Data to upload
 * @returns {Promise<{ success: boolean, message: string }>} Success status and (error) message
 */
async function upload (projectName: string, version: string, body: FormData): Promise<{ success: boolean, message: string }> {
  try {
    const resp = await fetch(`/api/${projectName}/${version}`,
      {
        method: 'POST',
        body
      }
    )

    if (resp.ok) {
      const json = await resp.json() as { message: string }
      const msg = json.message
      return { success: true, message: msg }
    }

    switch (resp.status) {
      case 401:
        return {
          success: false,
          message: 'Failed to upload documentation: Version already exists'
        }
      case 504:
        return {
          success: false,
          message: 'Failed to upload documentation: Server unreachable'
        }
      default:
        return {
          success: false,
          message: `Failed to upload documentation: ${(await resp.json() as { message: string }).message}`
        }
    }
  } catch (e) {
    return {
      success: false,
      message: `Failed to upload documentation: ${(e as { message: string }).message}}`
    }
  }
}

/**
 * Claim the project token
 * @param {string} projectName Name of the project
 */
async function claim (projectName: string): Promise<{ token: string }> {
  const resp = await fetch(`/api/${projectName}/claim`)

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
  const resp = await fetch(`/api/${projectName}/${version}`,
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

const exp = {
  escapeSlashesInUrl,
  getVersions,
  getLatestVersion,
  filterHiddenVersions,
  getProjectLogoURL,
  getProjectDocsURL,
  upload,
  claim,
  deleteDoc,
  compareVersions,
  isFavorite,
  setFavorite
}

export default exp
