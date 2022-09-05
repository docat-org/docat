<template>

  <md-card class="project-card">
    <router-link :to="`/${project}/${latestVersion}`">
      <md-card-header>
        <md-avatar :class="{ hidden: hideAvatar }">
          <img
            :alt="`${project} project logo`"
            :src="logoURL"
            @error="() => hideAvatar = true"
          />
        </md-avatar>
        <div class="md-title">{{ project }}</div>
        <div class="md-subhead">{{ versions.length }} Versions </div>
      </md-card-header>
      </router-link>

      <div class="star-div">
        <md-button class="md-icon-button" @click="switchFavourite()">
          <md-icon v-if="isFavourite" id="favourite-star">star</md-icon>
          <md-icon v-if="!isFavourite" id="not-favourite-star">star</md-icon>
        </md-button>
      </div>
    </md-card>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'Project',
  props: {
    project: String,
  },
  data() {
    return {
      logoURL: '',
      latestVersion: '',
      versions: [],
      hideAvatar: false,
      isFavourite: false,
    }
  },
  async created() {
    document.title = this.project + " | docat"
    this.logoURL = ProjectRepository.getProjectLogoURL(this.project)
    this.versions = await ProjectRepository.getVersions(this.project)
    this.latestVersion = (this.versions.find((version) => version.name == 'latest') || this.versions[0]).name
    this.isFavourite = ProjectRepository.isFavourite(this.project)
  },
  methods: {
    switchFavourite() {
      ProjectRepository.setFavourite(this.project, !this.isFavourite)
      this.isFavourite = !this.isFavourite;
      this.$emit("favouriteChanged")
    }
  }
}
</script>
<style lang="scss">
.project-card {
  margin-bottom: 10px;
  padding-bottom: 16px;
  padding-top: 16px;
  // FIXME: override broken material design
  max-width: calc(25% - 32px) !important;
  min-width: calc(25% - 32px) !important;
  flex: 1 1 calc(25% - 32px) !important;
}
.md-card-header {
  float: left;
  padding: 0px;
  padding-left: 16px;
}
.star-div {
  padding-right: 16px;
  float: right;
}
.md-avatar.hidden {
  display: none;
}
#favourite-star {
  color: rgb(80, 80, 80);
}
#not-favourite-star {
  color: #fff;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgb(80, 80, 80);
}
</style>