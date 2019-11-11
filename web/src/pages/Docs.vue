<template>
  <Layout class="docs-layout" :fullscreen="true">
    <iframe id="docs" :src="docURL" @load="onChange()"></iframe>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository.js'

export default {
  name: 'docs',
  components: {
    Layout
  },
  data() {
    return {
      docURL: this.$route.params.location || ProjectRepository.getProjectDocsURL(
        this.$route.params.project,
        this.$route.params.version
      )
    }
  },
  methods: {
    onChange() {
      const location = document.getElementById("docs")
        .contentWindow.location.href
      if (location) {
        this.$router.replace({
          params: {
            project: this.$route.params.project,
            version: this.$route.params.version,
            location
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
html,
body,
.docs-layout {
  height: 100%;
}

.docs-layout {
  .md-layout,
  .md-layout-item {
    height: 100%;
  }
}

#docs {
  width: 100%;
  height: 100%;
  border: none;
}

.md-app-content {
  padding: 0px;
}
</style>