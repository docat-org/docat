<template>
  <div id="app">
    <img alt="docat logo" src="./assets/logo.png">
    <ProjectOverview msg="Welcome to docat!"/>
  </div>
</template>

<script>
import ProjectOverview from './components/ProjectOverview.vue'

export default {
  name: 'app',
  components: {
    ProjectOverview
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
</style>
