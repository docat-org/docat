import { shallowMount } from '@vue/test-utils'

import ProjectRepository from '@/repositories/ProjectRepository'

import Project from '@/components/Project.vue'

ProjectRepository.getProjectLogoURL = (project) => `/api/${project}`
ProjectRepository.getVersions = () => [
  { name: '1.0.0', type: 'directory' },
  { name: 'latest', type: 'directory' }
]

const project = 'awesome-project'
const wrapper = shallowMount(Project, {
  propsData: { project },
  stubs: {
    'router-link': true,
    'md-card': true,
    'md-card-header': true,
    'md-avatar': true
  }
})

describe('Project.vue', () => {
  it('finds the latest version', () => {
    expect(wrapper.vm.$data.latestVersion).toMatch('latest')
  })

  it('gets the correct logo url', () => {
    expect(wrapper.vm.$data.logoURL).toMatch('/api/awesome-project')
  })

  it('fetches all versions correctly', () => {
    expect(wrapper.vm.$data.versions).toEqual(ProjectRepository.getVersions())
  })
})
