<template>
  <md-list-item :href="docURL">{{ version }}</md-list-item>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'ProjectVersion',
  props: {
    version: String,
  },
  data() {
    return {
      docURL: ProjectRepository.getProjectDocsURL(this.$route.params.project, this.version)
    }
  }
}
</script>
