<template>
  <div class="container">
    <iframe id="docs" :src="docURL" @load="onChange()"></iframe>
    <div class="controls">
      <md-button to="/" class="home-button md-fab md-primary">
        <md-icon>home</md-icon>
        <md-tooltip md-direction="left">docs overview</md-tooltip>
      </md-button>

      <md-field class="version-select">
        <md-select
          @md-selected="load()"
          v-model="selectedVersion"
          name="version"
          id="version"
        >
          <md-option
            v-for="version of versions"
            v-bind:key="version.name"
            :value="version.name"
          >
            {{ version.name + (version.tags.length ? ` (${version.tags.join(', ')})` : '') }}
          </md-option>
        </md-select>
      </md-field>
    </div>
  </div>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'docs',
  data() {
    return {
      selectedVersion: this.$route.params.version,
      versions: [],
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
    this.versions = (await ProjectRepository.getVersions(
      this.$route.params.project
    )).sort((a, b) => ProjectRepository.compareVersions(a, b))

    if (!this.selectedVersion) {
      this.selectedVersion = (this.versions.find((version) => (version.tags || []).includes('latest')) || this.versions[0]).name;
    }

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

.docs-layout {
  .md-layout,
  .md-layout-item {
    height: 100%;
  }
}

.version-select {
  width: 200px;
  float: right;
  background: white;
  border-radius: 7px;
  padding: 9px;
  margin-bottom: 0px;
  border: 1px solid rgba(0, 0, 0, 0.42);
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}

.md-field {
  &:after {
    display: none;
  }
}

.controls {
  position: absolute;
  bottom: 32px;
  right: 50px;
}

.home-button {
  border-radius: 7px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  margin-right: -1px;
  height: 52px;
  margin-top: 4px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.42);
}

#docs,
.container {
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
