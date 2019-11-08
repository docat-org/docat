<template>
  <div>
    <img :alt="`${name} - logo`" :src="logo" />
    <strong>{{ name }}</strong>
  </div>
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
h3 {
  margin: 40px 0 0;
}
</style>
