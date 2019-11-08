<template>
  <div>
    <Project
      v-for="project of projects"
      v-bind:key="project.name"
      :name="project.name"
      logo="assets/logo.png"
    />
  </div>
</template>

<script>
import Project from './Project.vue'
import ProjectRepository from '../repositories/ProjectRepository'

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
    const { data } = await ProjectRepository.get()
    this.projects = data
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
</style>
