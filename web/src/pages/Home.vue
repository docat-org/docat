<template>
  <Layout>
    <ProjectOverview class="spacing" />
  </Layout>
</template>

<script>
import ProjectOverview from '@/components/ProjectOverview.vue'
import Layout from '@/components/Layout.vue'

export default {
  name: 'home',
  components: {
    ProjectOverview,
    Layout
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.spacing {
  padding-top: 20px;
}
</style>
