<template>
  <div class="md-layout md-gutter">
    <Project
      class="md-layout-item md-size-25"
      v-for="project of projects"
      v-bind:key="project.name"
      :project="project"
    />
  </div>
</template>

<script>
import Project from '@/components/Project.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'ProjectOverview',
  components: {
    Project
  },
  data() {
    return {
      projects: []
    }
  },
  async created() {
    const { data: projects } = await ProjectRepository.get()
    this.projects = await Promise.all(projects.map(async (project) => {
      return {
        ...project,
        logo: await ProjectRepository.getProjectLogoURL(project.name),
        versions: (await ProjectRepository.getVersions(project.name)).data
      }
    }))
  }
}
</script>

