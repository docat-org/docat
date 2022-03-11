<template>
  <div>
    <div class="md-layout" v-if="favouriteProjects.length" >
      <Project
        @favouriteChanged="load"
        class="md-layout-item md-size-25"
        v-for="project of favouriteProjects"
        v-bind:key="project"
        :project="project"
      />
    </div>
    <div class="divider" v-if="nonFavouriteProjects.length && favouriteProjects.length"></div>
    <div class="md-layout" v-if="nonFavouriteProjects.length">
      <Project
        class="md-layout-item md-size-25"
        @favouriteChanged="load"
        v-for="project of nonFavouriteProjects"
        v-bind:key="project"
        :project="project"
      />
    </div>
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
      projects: [],
      favouriteProjects: [],
      nonFavouriteProjects: [],
    }
  },
  async created() {
    this.projects = await ProjectRepository.get()
    this.load()
  },
  methods: {
    load() {
      this.favouriteProjects = this.projects.filter(p => ProjectRepository.isFavourite(p))
      this.nonFavouriteProjects = this.projects.filter(p => !ProjectRepository.isFavourite(p))
    }
  }
}
</script>

<style>
.divider {
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
  padding-bottom: 16px;
}
</style>

