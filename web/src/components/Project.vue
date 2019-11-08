<template>
  <router-link :to="`/${name}`">
    <md-card>
      <md-card-header>
        <md-avatar>
          <img :alt="`${name} project logo`" :src="logo" />
        </md-avatar>

        <div class="md-title">{{ name }}</div>
      </md-card-header>
    </md-card>
  </router-link>
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