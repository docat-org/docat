<template>
  <Layout>
    <ProjectVersion
      v-for="version of versions"
      v-bind:key="version"
      :version="version"
    />
  </Layout>
</template>

<script>
import ProjectVersion from '@/components/ProjectVersion.vue'
import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'project',
  components: {
    ProjectVersion,
    Layout
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
