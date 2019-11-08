<template>
  <div>
    <ProjectVersion
        v-for="version of versions"
        v-bind:key="version"
        :version="version"
    />
  </div>
</template>

<script>
import ProjectVersion from '@/components/ProjectVersion.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'project',
  components: {
    ProjectVersion
  },
  data() {
    return {
      versions: []
    }
  },
  async created() {
    this.versions = (await ProjectRepository.getVersions(this.$route.params.project))
      .data
      .map((version) => version.name)
  }
}
</script>

<style>
</style>
