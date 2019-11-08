<template>
  <router-link :to="`/${project.name}`">
    <md-card>
      <md-card-header>
        <md-avatar>
          <img :alt="`${project.name} project logo`" :src="project.logo" />
        </md-avatar>

        <div class="md-title">{{ project.name }}</div>
        <div class="md-subhead">{{ project.versions.length }} Versions </div>
      </md-card-header>
    </md-card>
  </router-link>
</template>

<script>
export default {
  name: 'Project',
  props: {
    project: Object
  }
}
</script>