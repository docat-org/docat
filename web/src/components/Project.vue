<template>
  <md-card>
    <md-card-header>
      <md-avatar>
        <img :alt="`${name} project logo`" :src="logo" />
      </md-avatar>

      <div class="md-title">{{ name }}</div>
    </md-card-header>
  </md-card>
</template>

<script>
export default {
  name: 'Project',
  props: {
    name: String,
    logo: String
  }
}
</script>

<style scoped>
md-avatar img {
  height: var(--avatar-dimensions);
  width: var(--avatar-dimensions);
}
</style>
