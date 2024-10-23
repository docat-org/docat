/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-floating-promises */
// -> we need any for our mocks, and we need to disable require-await because we need to mock async functions that throw errors

import ProjectDetails from '../../models/ProjectDetails'
import { type Project } from '../../models/ProjectsResponse'
import ProjectRepository from '../../repositories/ProjectRepository'
const mockFetchData = (fetchData: any): void => {
  global.fetch = vi.fn().mockImplementation(
    async () =>
      await Promise.resolve({
        ok: true,
        json: async () => await Promise.resolve(fetchData)
      })
  )
}

const mockFetchError = (errorMsg = 'Error'): void => {
  global.fetch = vi.fn().mockImplementation(
    async () =>
      await Promise.resolve({
        ok: false,
        json: async () => await Promise.resolve({ message: errorMsg })
      })
  )
}

const mockFetchStatus = (status: number, message?: string): void => {
  global.fetch = vi.fn().mockImplementation(
    async () =>
      await Promise.resolve({
        ok: false,
        status,
        json: async () => await Promise.resolve({ message: message ?? 'Error' })
      })
  )
}

describe('get versions', () => {
  test('should return versions', async () => {
    const projectName = 'test'
    const versions = ['1.0.0', '2.0.0']
    const responseData = versions.map(
      (version) => new ProjectDetails(version, ['tag'], false, new Date())
    )

    mockFetchData({ versions: responseData })

    const result = await ProjectRepository.getVersions(projectName)

    expect(result).toEqual(responseData)
  })

  test('should return empty array on error and log error', async () => {
    const projectName = 'test'

    mockFetchError('Test Error')
    console.error = vi.fn()

    const result = await ProjectRepository.getVersions(projectName)

    expect(result).toEqual([])
    expect(console.error).toBeCalledWith('Test Error')
  })
})

describe('get project logo url', () => {
  test('should return the correct url', () => {
    const projectName = 'test-project'

    const result = ProjectRepository.getProjectLogoURL(projectName)

    expect(result).toEqual(`/doc/${projectName}/logo`)
  })
})

describe('get project docs url', () => {
  test('should return the correct url without path', () => {
    const projectName = 'test-project'
    const version = '1.0.0'

    const result = ProjectRepository.getProjectDocsURL(projectName, version)

    expect(result).toEqual(`/doc/${projectName}/${version}/`)
  })

  test('should return the correct url with path', () => {
    const projectName = 'test-project'
    const version = '1.0.0'
    const path = 'path/to/file'

    const result = ProjectRepository.getProjectDocsURL(
      projectName,
      version,
      path
    )

    expect(result).toEqual(`/doc/${projectName}/${version}/${path}`)
  })
})

describe('upload', () => {
  test('should post file', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchData({ message: 'Documentation was uploaded successfully' })

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    const { success, message } = await ProjectRepository.upload(
      project,
      version,
      body
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`/api/${project}/${version}`, {
      body,
      method: 'POST'
    })

    expect(success).toEqual(true)
    expect(message).toEqual('Documentation was uploaded successfully')
  })

  test('should throw version already exists on 401 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(401)

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    const { success, message } = await ProjectRepository.upload(
      project,
      version,
      body
    )

    expect(success).toEqual(false)
    expect(message).toEqual(
      'Failed to upload documentation: Version already exists'
    )
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(504)

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    const { success, message } = await ProjectRepository.upload(
      project,
      version,
      body
    )

    expect(success).toEqual(false)
    expect(message).toEqual(
      'Failed to upload documentation: Server unreachable'
    )
  })

  test('should throw error on other status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(500, 'Test Error')

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    const { success, message } = await ProjectRepository.upload(
      project,
      version,
      body
    )

    expect(success).toEqual(false)
    expect(message).toEqual('Failed to upload documentation: Test Error')
  })
})

describe('claim project', () => {
  test('should call claim api with project name', async () => {
    const project = 'test-project'

    mockFetchData({ token: 'test-token' })

    const respToken = await ProjectRepository.claim(project)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`/api/${project}/claim`)
    expect(respToken.token).toEqual('test-token')
  })

  test('should throw error when project already claimed', async () => {
    const project = 'test-project'

    mockFetchStatus(409, `Project ${project} is already claimed!`)

    expect(ProjectRepository.claim(project)).rejects.toThrow(
      `Project ${project} is already claimed!`
    )
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'

    mockFetchStatus(504)

    expect(ProjectRepository.claim(project)).rejects.toThrow(
      'Failed to claim project: Server unreachable'
    )
  })
})

describe('deleteDoc', () => {
  test('should call delete api with project name and version', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'

    mockFetchData({})

    await ProjectRepository.deleteDoc(project, version, token)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`/api/${project}/${version}`, {
      method: 'DELETE',
      headers: { 'Docat-Api-Key': token }
    })
  })

  test('should throw invalid token on 401 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'

    mockFetchStatus(401)

    expect(
      ProjectRepository.deleteDoc(project, version, token)
    ).rejects.toThrow('Failed to delete documentation: Invalid token')
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'

    mockFetchStatus(504)

    expect(
      ProjectRepository.deleteDoc(project, version, token)
    ).rejects.toThrow('Failed to delete documentation: Server unreachable')
  })

  test('should throw error on other status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'
    const error = 'Test Error'

    mockFetchStatus(500, error)

    expect(
      ProjectRepository.deleteDoc(project, version, token)
    ).rejects.toThrow(`Failed to delete documentation: ${error}`)
  })
})

describe('compare versions', () => {
  test('should sort doc versions as semantic versions', async () => {
    expect(
      ProjectRepository.compareVersions({ name: '0.0.0' }, { name: '0.0.1' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: 'a' }, { name: 'b' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions(
        { name: 'z' },
        { name: '', tags: ['latest'] }
      )
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.10' }, { name: '0.1.1' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.1' }, { name: '0.0.22' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.2' }, { name: '0.0.22' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.22' }, { name: '0.0.2' })
    ).toBeGreaterThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.3' }, { name: '0.0.22' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '0.0.2a' }, { name: '0.0.10' })
    ).toBeLessThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '1.2.0' }, { name: '1.0' })
    ).toBeGreaterThan(0)
    expect(
      ProjectRepository.compareVersions({ name: '1.2' }, { name: '2.0.0' })
    ).toBeLessThan(0)
  })
})

describe('favories', () => {
  test('should add and remove favourite projects correctly', () => {
    const project = 'test-project'

    expect(ProjectRepository.isFavorite(project)).toBe(false)

    ProjectRepository.setFavorite(project, false)
    expect(ProjectRepository.isFavorite(project)).toBe(false)

    ProjectRepository.setFavorite(project, true)
    expect(ProjectRepository.isFavorite(project)).toBe(true)

    ProjectRepository.setFavorite(project, false)
    expect(ProjectRepository.isFavorite(project)).toBe(false)
  })
})

describe('filterHiddenVersions', () => {
  test('should remove hidden versions', () => {
    const shownVersion: ProjectDetails = {
      name: 'v-2',
      tags: ['stable'],
      hidden: false,
      timestamp: new Date()
    }

    const hiddenVersion: ProjectDetails = {
      name: 'v-1',
      tags: ['latest'],
      hidden: true,
      timestamp: new Date()
    }

    const allProjects: Project[] = [
      {
        name: 'test-project-1',
        storage: "1 MB",
        versions: [shownVersion, hiddenVersion],
        logo: false
      }
    ]

    const shownProjects: Project[] = [
      {
        name: 'test-project-1',
        storage: "1 MB",
        versions: [shownVersion],
        logo: false
      }
    ]

    const result = ProjectRepository.filterHiddenVersions(allProjects)
    expect(result).toStrictEqual(shownProjects)
  })
  test('should remove the whole project if no shown versions are present', () => {
    const allProjects: Project[] = [
      {
        name: 'test-project-1',
        storage: "1 MB",
        versions: [
          {
            name: 'v-1',
            tags: ['latest'],
            hidden: true,
            timestamp: new Date()
          }
        ],
        logo: true
      }
    ]

    const result = ProjectRepository.filterHiddenVersions(allProjects)
    expect(result).toStrictEqual([])
  })
})

describe('getLatestVersion', () => {
  test('should return latest version by name', () => {
    const versions: ProjectDetails[] = [
      {
        name: '1.0.0',
        hidden: false,
        tags: [],
        timestamp: new Date()
      },
      {
        name: '2.0.0',
        hidden: false,
        tags: [],
        timestamp: new Date()
      }
    ]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[1])
  })

  test('should return version with latest in name', () => {
    const versions: ProjectDetails[] = [
      {
        name: '1.0.0',
        hidden: false,
        tags: [],
        timestamp: new Date()
      },
      {
        name: 'latest',
        hidden: false,
        tags: [],
        timestamp: new Date()
      }
    ]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[1])
  })

  test('should return version with latest tag', () => {
    const versions: ProjectDetails[] = [
      {
        name: '1.0.0',
        hidden: false,
        tags: ['latest'],
        timestamp: new Date()
      },
      {
        name: '2.0.0',
        hidden: false,
        tags: [],
        timestamp: new Date()
      }
    ]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[0])
  })

  test('should prefer version with latest in name over latest tag', () => {
    const versions: ProjectDetails[] = [
      {
        name: 'latest',
        hidden: false,
        tags: [],
        timestamp: new Date()
      },
      {
        name: '1.0.0',
        hidden: false,
        tags: ['latest'],
        timestamp: new Date()
      }
    ]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[0])
  })
})
