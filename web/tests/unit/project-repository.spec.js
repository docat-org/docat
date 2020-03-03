import mockAxios from 'axios'

import ProjectRepository from '@/repositories/ProjectRepository'

afterEach(() => {
  mockAxios.get.mockClear()
})

describe('ProjectRepository', () => {
  it('should return the correct logo URL', () => {
    expect(ProjectRepository.getProjectLogoURL('awesome-project'))
      .toMatch('https://do.cat/doc/awesome-project/logo.jpg')
  })

  it('should return the correct docs URL', () => {
    expect(ProjectRepository.getProjectDocsURL('pet-project', '1.0.0'))
      .toMatch('https://do.cat/doc/pet-project/1.0.0/')
  })

  it('should get all projects', async () => {
    const projects = [
      { name: 'awesome-project' },
      { name: 'pet-project' }
    ]
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: projects })
    )

    const result = (await ProjectRepository.get()).data

    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual(projects)
  })

  it('should get all versions of a project', async () => {
    const versions = [
      { name: '1.0', type: 'directory' },
      { name: '2.0', type: 'directory' },
      { name: 'image.png', type: 'file' }
    ]
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: versions })
    )

    const result = await ProjectRepository.getVersions('awesome--project')

    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(result).toEqual(versions.filter((version) => version.type == 'directory'))
  })

  it('should upload new documentation', async () => {
    mockAxios.post.mockImplementationOnce()

    await ProjectRepository.upload('awesome--project', '4.0', { data: true })

    expect(mockAxios.post).toHaveBeenCalledTimes(1)
  })
})
