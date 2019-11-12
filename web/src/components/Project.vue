<template>
  <router-link :to="`/${project}/${latestVersion}`">
    <md-card>
      <md-card-header>
        <md-avatar>
          <img :alt="`${project} project logo`" :src="logoURL" />
        </md-avatar>

        <div class="md-title">{{ project }}</div>
        <div class="md-subhead">{{ versions.length }} Versions </div>
      </md-card-header>
    </md-card>
  </router-link>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'Project',
  props: {
    project: String
  },
  data() {
    return {
      logoURL: '',
      latestVersion: '',
      versions: [],
    }
  },
  async created() {
    this.logoURL = ProjectRepository.getProjectLogoURL(this.project)
    this.versions = await ProjectRepository.getVersions(this.project)
    this.latestVersion = (this.versions.find((version) => version.name == 'latest') || this.versions[0]).name
  }
}
</script>