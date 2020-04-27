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
      docURL: this.$route.params.location || ProjectRepository.getProjectDocsURL(
        this.$route.params.project,
        this.$route.params.version
      )
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.docURL = ProjectRepository.getProjectDocsURL(
      to.params.project,
      to.params.version
    )
    next()
  },
  async created() {
    this.versions = (await ProjectRepository.getVersions(
      this.$route.params.project
    )).map((version) => version.name)

    // listen on anchor tag changes
    const component = this
    document.getElementById("docs")
      .contentWindow.addEventListener("hashchange", (event) =>
        component.load(event.newURL))
  },
  methods: {
    onChange() {
      const docsFrame = document.getElementById("docs")
      docsFrame.contentWindow.document.querySelectorAll('a').forEach((a) => {
        if (!a.href.startsWith(location.origin)) {
          // open all foreign links in a new tab
          a.setAttribute('target', '_blank')
        }
      })

      const docsLocation = docsFrame.contentWindow.location.href
      if (docsLocation) {
        this.load(docsLocation)
      }
    },
    load(docsLocation) {
      this.$router.replace({
        params: {
          project: this.$route.params.project,
          version: this.selectedVersion,
          location: docsLocation
        }
      })
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
}

.project-name {
  margin-left: 16px;
  margin-top: 26px;
  font-size: 16px;
  display: inline-block;
}
</style>