<template>
  <Layout class="docs-layout" :fullscreen="true">
    <template v-slot:toolbar>
      <span class="project-name">{{ $route.params.project }}</span>
      <md-field class="version-select">
        <md-select
          @md-selected="load()"
          v-model="selectedVersion"
          name="version"
          id="version"
        >
          <md-option
            v-for="version of versions"
            v-bind:key="version"
            :value="version"
          >
            {{ version }}
          </md-option>
        </md-select>
      </md-field>
    </template>
    <iframe id="docs" :src="docURL" @load="onChange()"></iframe>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'docs',
  components: {
    Layout
  },
  data() {
    return {
      selectedVersion: this.$route.params.version,
      versions: [],
      docURL: ProjectRepository.getProjectDocsURL(
        this.$route.params.project,
        this.$route.params.version,
        (this.$route.params.location || '') + (this.$route.hash || '')
      )
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.version !== from.params.version) {
      // hard reload iframe only when switching versions
      this.docURL = ProjectRepository.getProjectDocsURL(
        to.params.project,
        to.params.version
      )
    }
    next()
  },
  async created() {
    document.title = this.$route.params.project
    this.versions = (await ProjectRepository.getVersions(
      this.$route.params.project
    )).map((version) => version.name)
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

      this.load(docsFrame.contentWindow.location.href)
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

.docs-layout {
  .md-layout,
  .md-layout-item {
    height: 100%;
  }
}

.version-select {
  width: 200px;
  float: right;
}

#docs {
  width: 100%;
  height: 100%;
  border: none;
}

.md-list-item.md-selected {
  .md-list-item-text {
    color: #a2a2a2;
  }
}

.md-app-content {
  padding: 0px;
  height: 100%;
}

.project-name {
  margin-left: 16px;
  margin-top: 26px;
  font-size: 16px;
  display: inline-block;
}

.docs-claim-button {
  position: fixed;
  bottom: 16px;
}

@media all {
  .docs-claim-button {
    right: 80px;
  }
}

.docs-delete-button {
  position: fixed;
  bottom: 16px;
}

@media all {
  .docs-delete-button {
    right: 16px;
  }
}
</style>
