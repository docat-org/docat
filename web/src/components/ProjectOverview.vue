<template>
  <div>
    <Project
      v-for="project of projects"
      v-bind:key="project.name"
      :name="project.name"
      :logo="project.logo"
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
        logo: await ProjectRepository.getProjectLogoURL(project.name)
      }
    }))
  }
}
</script>

