<template>
  <div>
    <Layout>
      <ProjectOverview class="spacing" />
    </Layout>
    <UploadButton class="upload-button" />
    <ClaimButton class="claim-button" />
    <DeleteButton class="delete-button" />
  </div>
</template>

<script>
import ProjectOverview from '@/components/ProjectOverview.vue'
import Layout from '@/components/Layout.vue'
import UploadButton from '@/components/UploadButton.vue'
import ClaimButton from '@/components/ClaimButton.vue'
import DeleteButton from '@/components/DeleteButton.vue'

export default {
  name: 'home',
  components: {
    ProjectOverview,
    Layout,
    UploadButton,
    ClaimButton,
    DeleteButton
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

.upload-button {
  position: fixed;
  bottom: 16px;
}
.claim-button {
  position: fixed;
  bottom: 16px;
}
.delete-button {
  position: fixed;
  bottom: 16px;
}

@media all {
  .upload-button {
    right: 144px;
  }
  .claim-button {
    right: 80px;
  }
  .delete-button {
    right: 16px;
  }
}
</style>
