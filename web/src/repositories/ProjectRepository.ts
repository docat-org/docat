import semver from 'semver'
import ProjectVersion, { isProjectVersionEqual } from '../models/ProjectVersion'
import { type Project } from '../models/ProjectsResponse'

const RESOURCE = 'doc'

function dateTimeReviver(key: string, value: unknown) {
  if (key === 'timestamp') {
    return new Date(value as string)
  }
  return value
}

function filterHiddenVersions(allProjects: Project[]): Project[] {
  // create deep-copy first
  const projects = JSON.parse(JSON.stringify(allProjects), dateTimeReviver) as Project[]

  projects.forEach((p) => {
    p.versions = p.versions.filter((v) => !v.hidden)
  })

  return projects.filter((p) => p.versions.length > 0)
}

/**
 * Returns a list of all versions of a project.
 * @param {string} projectName Name of the project
 */
async function getVersions(projectName: string): Promise<ProjectVersion[]> {
  const res = await fetch(`/api/projects/${projectName}?include_hidden=true`)

  if (!res.ok) {
    console.error(((await res.json()) as { message: string }).message)
    return []
  }

  const json = (await res.json()) as {
    versions: ProjectVersion[]
  }

  return json.versions
}

/**
 * Returns the latest version of a project.
 * Order of precedence: latest, latest tag, latest version
 * @param versions all versions of a project
 */
function getLatestVersion(versions: ProjectVersion[]): ProjectVersion {
  const latest = versions.find((v) => v.name.includes('latest'))
  if (latest != null) {
    return latest
  }

  const latestTag = versions.find((v) => v.tags.includes('latest'))
  if (latestTag != null) {
    return latestTag
  }

  const sortedVersions = versions.sort((a, b) => compareVersions(a, b))

  return sortedVersions[sortedVersions.length - 1]
}

/**
 * Returns the logo URL of a given project
 * @param {string} projectName Name of the project
 */
function getProjectLogoURL(projectName: string): string {
  return `/${RESOURCE}/${projectName}/logo`
}

/**
 * Returns the project documentation URL
 * @param {string} projectName Name of the project
 * @param {string} version Version name
 * @param {string?} docsPath Path to the documentation page
 * @param {string?} hash Hash part of the url (html id)
 */
function getProjectDocsURL(
  projectName: string,
  version: string,
  docsPath?: string,
  hash?: string
): string {
  return `/${RESOURCE}/${projectName}/${version}/${docsPath ?? ''}${hash ?? ''}`
}

/**
 * Uploads new project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {FormData} body Data to upload
 * @returns {Promise<{ success: boolean, message: string }>} Success status and (error) message
 */
async function upload(
  projectName: string,
  version: string,
  body: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await fetch(`/api/${projectName}/${version}`, {
      method: 'POST',
      body
    })

    if (resp.ok) {
      const json = (await resp.json()) as { message: string }
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
          message: `Failed to upload documentation: ${((await resp.json()) as { message: string }).message}`
        }
    }
  } catch (e) {
    return {
      success: false,
      message: `Failed to upload documentation: ${(e as { message: string }).message}`
    }
  }
}

/**
 * Claim the project token
 * @param {string} projectName Name of the project
 */
async function claim(projectName: string): Promise<{ token: string }> {
  const resp = await fetch(`/api/${projectName}/claim`)

  if (resp.ok) {
    const json = (await resp.json()) as { token: string }
    return json
  }

  switch (resp.status) {
    case 504:
      throw new Error('Failed to claim project: Server unreachable')
    default:
      throw new Error(
        `Failed to claim project: ${((await resp.json()) as { message: string }).message}`
      )
  }
}

/**
 * Deletes existing project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {string} token Token to authenticate
 */
async function deleteDoc(
  projectName: string,
  version: string,
  token: string
): Promise<void> {
  const headers = { 'Docat-Api-Key': token }
  const resp = await fetch(`/api/${projectName}/${version}`, {
    method: 'DELETE',
    headers
  })

  if (resp.ok) return

  switch (resp.status) {
    case 401:
      throw new Error('Failed to delete documentation: Invalid token')
    case 504:
      throw new Error('Failed to delete documentation: Server unreachable')
    default:
      throw new Error(
        `Failed to delete documentation: ${((await resp.json()) as { message: string }).message}`
      )
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
function compareVersions(
  versionA: { name: string; tags?: string[] },
  versionB: { name: string; tags?: string[] }
): number {
  if ((versionA.tags ?? []).includes('latest')) {
    return 1
  }

  if ((versionB.tags ?? []).includes('latest')) {
    return -1
  }

  const semverA = semver.coerce(versionA.name)
  const semverB = semver.coerce(versionB.name)

  if (semverA == null || semverB == null) {
    return versionA.name.localeCompare(versionB.name)
  }

  return semver.compare(semverA, semverB)
}

/**
 * Compare two lists of ProjectVersions if they are equal, meaning they contain
 * the same versions with the same properties, regardless of order.
 *
 * @param {Object} versionsA first list of ProjectVersions to compare
 * @param {Object} versionsB second list of ProjectVersions to compare
 */
function isVersionListEqual(versionsA: ProjectVersion[] | null, versionsB: ProjectVersion[] | null): boolean {
  if (versionsA === null || versionsB === null) {
    return versionsA === versionsB
  }

  if (versionsA.length !== versionsB.length) {
    return false
  }
  const sortedVersionsA = versionsA.sort((v1, v2) => compareVersions(v1, v2))
  const sortedVersionsB = versionsB.sort((v1, v2) => compareVersions(v1, v2))

  for (let j = 0; j < sortedVersionsA.length; j++) {
    if (!isProjectVersionEqual(sortedVersionsA[j], sortedVersionsB[j])) {
      return false
    }
  }

  return true
}

/**
 * Compare two lists of Projects if they are equal, meaning they contain
 * the same projects with the same properties, regardless of order.
 *
 * @param {Object} projectsA first list of Projects to compare
 * @param {Object} projectsB second list of Projects to compare
 */
function isProjectListEqual(projectsA: Project[] | null, projectsB: Project[] | null): boolean {
  if (projectsA === null || projectsB === null) {
    return projectsA === projectsB
  }

  if (projectsA.length !== projectsB.length) {
    return false
  }

  for (let i = 0; i < projectsA.length; i++) {
    if (projectsA[i].name !== projectsB[i].name
      || projectsA[i].logo !== projectsB[i].logo
      || projectsA[i].storage !== projectsB[i].storage) {
      return false
    }

    if (!isVersionListEqual(projectsA[i].versions, projectsB[i].versions)) {
      return false
    }
  }
  return true
}

/**
 * Returns boolean indicating if the project name is part of the favorites.
 * @param {string} projectName name of the project
 * @returns {boolean} - true is project is favorite
 */
function isFavorite(projectName: string): boolean {
  return localStorage.getItem(projectName) === 'favorite'
}

/**
 * Sets favorite preference on project
 * @param {string} projectName
 * @param {boolean} shouldBeFavorite
 */
function setFavorite(projectName: string, shouldBeFavorite: boolean): void {
  if (shouldBeFavorite) {
    localStorage.setItem(projectName, 'favorite')
  } else {
    localStorage.removeItem(projectName)
  }
}

const exp = {
  getVersions,
  getLatestVersion,
  filterHiddenVersions,
  getProjectLogoURL,
  getProjectDocsURL,
  upload,
  claim,
  deleteDoc,
  compareVersions,
  isVersionListEqual,
  isProjectListEqual,
  isFavorite,
  setFavorite
}

export default exp
