<template>
  <div class="container">

    <iframe id="docs" :src="docURL" @load="onChange()"></iframe>

    <HomeButton class="home-button floating-button"/>
    <VersionsButton class="versions-button floating-button"/>

  </div>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'
import HomeButton from '@/components/HomeButton.vue'
import VersionsButton from '@/components/VersionsButton.vue'

export default {
  name: 'docs',
  components: {
    HomeButton,
    VersionsButton,
  },
  data() {
    return {
      selectedVersion: this.$route.params.version,
      docURL: undefined
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.version && to.params.version !== from.params.version) {
      // hard reload iframe only when switching versions
      this.docURL = ProjectRepository.getProjectDocsURL(
        to.params.project,
        to.params.version
      )
    }
    next()
  },
  async created() {
    document.title = this.$route.params.project + " | docat"

    this.docURL = ProjectRepository.getProjectDocsURL(
      this.$route.params.project,
      this.selectedVersion,
      (this.$route.params.location || '') + (this.$route.hash || '')
    )
  },
  methods: {
    onChange() {
      const docsFrame = document.getElementById('docs')
      docsFrame.contentWindow.document.querySelectorAll('a').forEach((a) => {
        if (!a.href.startsWith(location.origin)) {
          // open all foreign links in a new tab
          a.setAttribute('target', '_blank')
        }
      })
      
      if(this.docURL) {
        this.load(docsFrame.contentWindow.location.href)
      }
    },
    load(docPath) {

      // listen on anchor tag changes
      const component = this
      document.getElementById('docs')
        .contentWindow.addEventListener('hashchange', (event) =>
          component.load(event.newURL))

      // set document path in actual url
      if (docPath) {
        docPath = ProjectRepository.getDocsPath(
          this.$route.params.project,
          this.selectedVersion,
          docPath
        )
      }
      this.$router.replace(
        `/${this.$route.params.project}/${this.selectedVersion}/${docPath || ''}`
      ).catch(() => {})  // NavigationDuplicate
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

@media all {
  .home-button {
    right: 80px;
  }
  .versions-button {
    right: 16px;
  }
}

.floating-button {
  position: fixed;
  bottom: 16px;
}

#docs,
.container {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
