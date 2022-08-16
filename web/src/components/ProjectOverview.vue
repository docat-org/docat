<template>
  <div class="md-layout">
    <Project
      class="md-layout-item md-size-25"
      v-for="project of projects"
      v-bind:key="project"
      :project="project"
    />
    <Help v-if="!projects.length" />
  </div>
</template>

<script>
import Help from '@/components/Help.vue'
import Project from '@/components/Project.vue'

import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'ProjectOverview',
  components: {
    Project,
    Help
  },
  data() {
    return {
      projects: []
    }
  },
  async created() {
    this.projects = await ProjectRepository.get()
  }
}
</script>

