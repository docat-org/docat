/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-floating-promises */
// -> we need any for our mocks, and we need to disable require-await because we need to mock async functions that throw errors

import ProjectRepository from '../../repositories/ProjectRepository'
import ProjectDetails from '../../models/ProjectDetails'
import { Project } from '../../models/ProjectsResponse'
const mockFetchData = (fetchData: any): void => {
  global.fetch = jest.fn().mockImplementation(async () => await Promise.resolve({
    ok: true,
    json: async () => await Promise.resolve(fetchData)
  }))
}

const mockFetchError = (errorMsg = 'Error'): void => {
  global.fetch = jest.fn().mockImplementation(async () => await Promise.resolve({
    ok: false,
    json: async () => await Promise.resolve({ message: errorMsg })
  }))
}

const mockFetchStatus = (status: number, message?: string): void => {
  global.fetch = jest.fn().mockImplementation(async () => await Promise.resolve({
    ok: false,
    status,
    json: async () => await Promise.resolve({ message: message ?? 'Error' })
  }))
}

describe('get versions', () => {
  test('should return versions', async () => {
    const projectName = 'test'
    const versions = ['1.0.0', '2.0.0']
    const responseData = versions.map(version => (new ProjectDetails(version, ['tag'], false)))

    mockFetchData({ versions: responseData })

    const result = await ProjectRepository.getVersions(projectName)

    expect(result).toEqual(responseData)
  }
  )

  test('should return empty array on error and log error', async () => {
    const projectName = 'test'

    mockFetchError('Test Error')
    console.error = jest.fn()

    const result = await ProjectRepository.getVersions(projectName)

    expect(result).toEqual([])
    expect(console.error).toBeCalledWith('Test Error')
  })
}
)

describe('search', () => {
  test('should find projects', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['tag'],
            hidden: false
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, 'test')

    expect(result.projects).toEqual([{ name: 'test-project' }])
    expect(result.versions).toEqual([])
  })

  test('should find projects full match', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['tag'],
            hidden: false
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, ' test-Project ')

    expect(result.projects).toEqual([{ name: 'test-project' }])
    expect(result.versions).toEqual([])
  })

  test('should ignore projects with all versions hidden', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['tag'],
            hidden: true
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, 'test')

    expect(result.projects).toEqual([])
    expect(result.versions).toEqual([])
  })

  test('should find versions', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['tag'],
            hidden: false
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, '1.0')

    expect(result.projects).toEqual([])
    expect(result.versions).toEqual([{ version: '1.0.0', project: 'test-project' }])
  })

  test('should ignore hidden versions', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['tag'],
            hidden: true
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, '1.0')

    expect(result.projects).toEqual([])
    expect(result.versions).toEqual([])
  })

  test('should find tags', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['first', 'second'],
            hidden: false
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, 'fir')

    expect(result.projects).toEqual([])
    expect(result.versions).toEqual([{ version: 'first', project: 'test-project' }])
  })

  test('should ignore hidden tags', () => {
    const projects: Project[] = [
      {
        name: 'test-project',
        logo: false,
        versions: [
          {
            name: '1.0.0',
            tags: ['first', 'second'],
            hidden: true
          }
        ]
      }
    ]

    const result = ProjectRepository.search(projects, 'sec')

    expect(result.projects).toEqual([])
    expect(result.versions).toEqual([])
  }
  )
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

    const result = ProjectRepository.getProjectDocsURL(projectName, version, path)

    expect(result).toEqual(`/doc/${projectName}/${version}/${path}`)
  })
})

describe('upload', () => {
  test('should post file', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchData({})

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    await ProjectRepository.upload(project, version, body)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`/api/${project}/${version}`,
      {
        body,
        method: 'POST'
      }
    )
  })

  test('should throw version already exists on 401 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(401)

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    expect(ProjectRepository.upload(project, version, body)
    ).rejects.toThrow('Failed to upload documentation: Version already exists')
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(504)

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    expect(ProjectRepository.upload(project, version, body)
    ).rejects.toThrow('Failed to upload documentation: Server unreachable')
  })

  test('should throw error on other status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'

    mockFetchStatus(500, 'Test Error')

    const body = new FormData()
    body.append('file', new Blob([''], { type: 'text/plain' }))

    expect(ProjectRepository.upload(project, version, body)
    ).rejects.toThrow('Failed to upload documentation: Test Error')
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

    expect(ProjectRepository.claim(project)).rejects.toThrow(`Project ${project} is already claimed!`)
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'

    mockFetchStatus(504)

    expect(ProjectRepository.claim(project)
    ).rejects.toThrow('Failed to claim project: Server unreachable')
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
    expect(global.fetch).toHaveBeenCalledWith(`/api/${project}/${version}`, { method: 'DELETE', headers: { 'Docat-Api-Key': token } })
  })

  test('should throw invalid token on 401 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'

    mockFetchStatus(401)

    expect(ProjectRepository.deleteDoc(project, version, token)).rejects.toThrow('Failed to delete documentation: Invalid token')
  })

  test('should throw server unreachable on 504 status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'

    mockFetchStatus(504)

    expect(ProjectRepository.deleteDoc(project, version, token)).rejects.toThrow('Failed to delete documentation: Server unreachable')
  })

  test('should throw error on other status code', async () => {
    const project = 'test-project'
    const version = '1.0.0'
    const token = 'test-token'
    const error = 'Test Error'

    mockFetchStatus(500, error)

    expect(ProjectRepository.deleteDoc(project, version, token)).rejects.toThrow(`Failed to delete documentation: ${error}`)
  })
})

describe('compare versions', () => {
  test('should sort doc versions as semantic versions', async () => {
    expect(ProjectRepository.compareVersions({ name: '0.0.0' }, { name: '0.0.1' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: 'a' }, { name: 'b' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: 'z' }, { name: '', tags: ['latest'] })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.10' }, { name: '0.1.1' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.1' }, { name: '0.0.22' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.2' }, { name: '0.0.22' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.22' }, { name: '0.0.2' })).toBeGreaterThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.3' }, { name: '0.0.22' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '0.0.2a' }, { name: '0.0.10' })).toBeLessThan(0)
    expect(ProjectRepository.compareVersions({ name: '1.2.0' }, { name: '1.0' })).toBeGreaterThan(0)
    expect(ProjectRepository.compareVersions({ name: '1.2' }, { name: '2.0.0' })).toBeLessThan(0)
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
      hidden: false
    }

    const hiddenVersion: ProjectDetails =
    {
      name: 'v-1',
      tags: ['latest'],
      hidden: true
    }

    const allProjects: Project[] = [
      {
        name: 'test-project-1',
        versions: [shownVersion, hiddenVersion],
        logo: false
      }
    ]

    const shownProjects: Project[] = [
      {
        name: 'test-project-1',
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
        versions: [
          {
            name: 'v-1',
            tags: ['latest'],
            hidden: true
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
        tags: []
      },
      {
        name: '2.0.0',
        hidden: false,
        tags: []
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
        tags: []
      },
      {
        name: 'latest',
        hidden: false,
        tags: []
      }]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[1])
  })

  test('should return version with latest tag', () => {
    const versions: ProjectDetails[] = [
      {
        name: '1.0.0',
        hidden: false,
        tags: ['latest']
      },
      {
        name: '2.0.0',
        hidden: false,
        tags: []
      }]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[0])
  })

  test('should prefer version with latest in name over latest tag', () => {
    const versions: ProjectDetails[] = [
      {
        name: 'latest',
        hidden: false,
        tags: []
      },
      {
        name: '1.0.0',
        hidden: false,
        tags: ['latest']
      }
    ]

    const latestVersion = ProjectRepository.getLatestVersion(versions)
    expect(latestVersion).toStrictEqual(versions[0])
  })
})

describe('escapeSlashesInUrl', () => {
  test('should ignore version and project name', () => {
    const url = '/project/1.0.0'

    expect(ProjectRepository.escapeSlashesInUrl(url, '', '')).toBe(url)
  })

  test('should ignore trailing slash', () => {
    const given = '/project/1.0.0/'
    const expected = '/project/1.0.0'

    expect(ProjectRepository.escapeSlashesInUrl(given, '', '')).toBe(expected)
  })

  test('should escape slashes in path', () => {
    const given = '/project/1.0.0/path/with/slashes'
    const expected = '/project/1.0.0/path%2Fwith%2Fslashes'

    expect(ProjectRepository.escapeSlashesInUrl(given, '', '')).toBe(expected)
  })

  test('should work with query parameters', () => {
    const given = '/project/1.0.0/path/with/slashes'
    const query = '?param=value'
    const expected = '/project/1.0.0/path%2Fwith%2Fslashes?param=value'

    expect(ProjectRepository.escapeSlashesInUrl(given, query, '')).toBe(expected)
  })

  test('should work with hash', () => {
    const given = '/project/1.0.0/path/with/slashes'
    const hash = '#hash'
    const expected = '/project/1.0.0/path%2Fwith%2Fslashes#hash'

    expect(ProjectRepository.escapeSlashesInUrl(given, '', hash)).toBe(expected)
  })

  test('should work with query parameters and hash', () => {
    const given = '/project/1.0.0/path/with/slashes'
    const query = '?param=value'
    const hash = '#hash'
    const expected = '/project/1.0.0/path%2Fwith%2Fslashes#hash?param=value'

    expect(ProjectRepository.escapeSlashesInUrl(given, query, hash)).toBe(expected)
  })
})
