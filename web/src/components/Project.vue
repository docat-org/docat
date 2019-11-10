<template>
  <router-link :to="`/${project}`">
    <md-card>
      <md-card-header>
        <md-avatar>
          <img :alt="`${project} project logo`" :src="project.logo" />
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
      logo: "",
      versions: []
    }
  },
  async created() {
    this.logo = ProjectRepository.getProjectLogoURL(this.project)
    this.versions = (await ProjectRepository.getVersions(this.project)).data
  }
}
</script>