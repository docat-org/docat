<template>
  <div class="md-layout">
    <Project
      class="md-layout-item md-size-25"
      v-for="project of projects"
      v-bind:key="project.name"
      :project="project.name"
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
    this.projects = (await ProjectRepository.get()).data
  }
}
</script>

