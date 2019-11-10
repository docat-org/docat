<template>
  <a :href="docURL">
    <div>{{ version }}</div>
  </a>
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
