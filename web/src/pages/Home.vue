<template>
  <div>
    <Layout>
      <ProjectOverview class="spacing" />
    </Layout>
    <UploadButton class="uppload-button" />
  </div>
</template>

<script>
import ProjectOverview from '@/components/ProjectOverview.vue'
import Layout from '@/components/Layout.vue'
import UploadButton from '@/components/UploadButton.vue'

export default {
  name: 'home',
  components: {
    ProjectOverview,
    Layout,
    UploadButton
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

.uppload-button {
  position: fixed;
  bottom: 16px;
}

@media all and (max-width: 959px) {
  .uppload-button {
    right: 16px;
  }
}
@media all and (min-width: 959px) {
  .uppload-button {
    right: 15%;
  }
}
</style>
