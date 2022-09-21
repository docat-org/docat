
import ProjectRepository from '@/repositories/ProjectRepository'

ProjectRepository.baseURL = 'https://do.cat'

const mockFetchData = (fetchData) => {
  global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(fetchData)
  }))
}

const mockFetchError = (error = "Error") => {
  global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: error })
  }))
}

describe('ProjectRepository', () => {


  it('should return the correct logo URL', () => {
    expect(ProjectRepository.getProjectLogoURL('awesome-project'))
      .toMatch('https://do.cat/doc/awesome-project/logo.png')
  })


  it('should return the correct docs URL', () => {
    expect(ProjectRepository.getProjectDocsURL('pet-project', '1.0.0'))
      .toMatch('https://do.cat/doc/pet-project/1.0.0/')
  })


  it('should get all projects', async () => {
    const projects = {
      'projects': [
        'awesome-project',
        'pet-project'
      ]
    }
    mockFetchData(projects)

    const result = await ProjectRepository.get()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual(projects.projects)
  })


  it('correctly get relative docs path', () => {
    const [project, version, expectedPath] = ['project', '1.0', 'index.html']
    const absoluteDocsPath = `https://do.cat/doc/${project}/${version}/${expectedPath}`

    const relativeDocsPath = ProjectRepository.getDocsPath('project', '1.0', absoluteDocsPath)

    expect(relativeDocsPath).toEqual(expectedPath)
  })


  it('should get all versions of a project', async () => {
    const versions = {
      'name': 'awesome--project',
      'versions': [
        { name: '1.0', tags: [] },
        { name: '2.0', type: [] },
      ]
    }
    mockFetchData(versions)

    const result = await ProjectRepository.getVersions('awesome--project')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual(versions.versions)
  })


  it('should upload new documentation', async () => {
    mockFetchData({})

    await ProjectRepository.upload('awesome-project', '4.0', { data: true })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('https://do.cat/api/awesome-project/4.0',
      {
        'body': { 'data': true },
        'method': 'POST'
      }
    )
  })

  it('should throw error when uploading new documentation fails', async () => {
    const errorMessage = "Failed to upload documentation"
    mockFetchError(errorMessage)


    expect(ProjectRepository.upload('existing-project', '4.0', { data: true })).rejects.toThrow(errorMessage)
    expect(global.fetch).toHaveBeenCalledTimes(1)

  })

  it('should delete an existing documentation', async () => {
    mockFetchData({})

    await ProjectRepository.deleteDoc('awesome-project', '1.2', '1234')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('https://do.cat/api/awesome-project/1.2',
      {
        'method': 'DELETE',
        'headers': { 'Docat-Api-Key': '1234' }
      }
    )
  })

  it('should throw error when deleting existing documentation fails', async () => {
    const errorMessage = "Failed to delete documentation"
    mockFetchError(errorMessage)


    expect(ProjectRepository.deleteDoc('existing-project', '4.0', { data: true })).rejects.toThrow(errorMessage)
    expect(global.fetch).toHaveBeenCalledTimes(1)

  })

  it('should sort doc versions as semantic versions', async () => {
    expect(ProjectRepository.compareVersions({name: '0.0.0'}, {name: '0.0.1'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: 'a'}, {name: 'b'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: 'z'}, {name: '', tags: ['latest']})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.10'}, {name: '0.1.1'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.1'}, {name: '0.0.22'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.2'}, {name: '0.0.22'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.22'}, {name: '0.0.2'})).toBeGreaterThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.3'}, {name: '0.0.22'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '0.0.2a'}, {name: '0.0.10'})).toBeLessThan(0);
    expect(ProjectRepository.compareVersions({name: '1.2.0'}, {name: '1.0'})).toBeGreaterThan(0);
    expect(ProjectRepository.compareVersions({name: '1.2'}, {name: '2.0.0'})).toBeLessThan(0);
  })

  it('should add and remove favourite projects correctly', () => {
      expect(ProjectRepository.isFavourite("mytest-project")).toBeFalsy()
      ProjectRepository.setFavourite("mytest-project", false)
      expect(ProjectRepository.isFavourite("mytest-project")).toBeFalsy()
      ProjectRepository.setFavourite("mytest-project", true)
      expect(ProjectRepository.isFavourite("mytest-project")).toBeTruthy()
      ProjectRepository.setFavourite("mytest-project", false)
      expect(ProjectRepository.isFavourite("mytest-project")).toBeFalsy()
  })
})
