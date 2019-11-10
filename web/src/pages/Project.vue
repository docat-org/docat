<template>
  <Layout>
    <Project :project="$route.params.project" />
    <md-card>
      <md-card-content>
        <md-list>
          <ProjectVersion
            v-for="version of versions"
            v-bind:key="version"
            :version="version"
          />
        </md-list>
      </md-card-content>
    </md-card>
  </Layout>
</template>

<script>
import ProjectVersion from '@/components/ProjectVersion.vue'
import Layout from '@/components/Layout.vue'
import Project from '@/components/Project.vue'

import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'project',
  components: {
    ProjectVersion,
    Layout,
    Project
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
