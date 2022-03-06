<template>
    <md-menu md-direction="top-start" md-size="big" md-align-trigger>
        <md-button md-menu-trigger class="md-fab md-primary">
            <md-icon>menu</md-icon>
            <md-tooltip md-direction="left">select the version of the project</md-tooltip>
        </md-button>
        <md-menu-content>
            <md-menu-item v-for="version of versions" v-bind:key="version" :href="createRedirection(version)" >{{ version }}</md-menu-item>
        </md-menu-content>
    </md-menu>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'VersionsButton',
  data() {
    return {
      selectedVersion: this.$route.params.version,
      versions: [],
      docURL: undefined,
      projectName: this.$route.params.project,
    }
  },
  async created() {
    this.versions = (await ProjectRepository.getVersions(
      this.$route.params.project
    )).map((version) => version.name).sort(ProjectRepository.compareVersions)

    if (!this.selectedVersion) {
      this.selectedVersion = (this.versions.find((version) => version == 'latest') || this.versions[0]);
    }
  },
  methods: {
    createRedirection(newVersion) {
      let docPath = ProjectRepository.getDocsPath(
          this.$route.params.project,
          this.selectedVersion,
          window.location.href
        )
      return ProjectRepository.getProjectDocsURL(this.$route.params.project, newVersion, docPath || '', "#")
    },
  }
}
</script>

<style lang="scss">
.md-menu{
    margin: 6px 8px;
}
</style>