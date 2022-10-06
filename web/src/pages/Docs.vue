<template>
  <div class="container">
    <iframe id="docs" :src="docURL" @load="onChange()"></iframe>
    <div class="controls" v-if="showControls">
      <md-button to="/" class="home-button md-fab md-primary">
        <md-icon>home</md-icon>
        <md-tooltip md-direction="left">docs overview</md-tooltip>
      </md-button>

      <md-field class="version-select">
        <md-select
          @md-selected="dropdownSelect()"
          v-model="dropdownVersion"
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

      <md-button class="hide-controls-button md-fab md-secondary" @click="onHideControlsClick()">
        <md-icon>visibility_off</md-icon>
        <md-tooltip md-direction="bottom">Hide Controls</md-tooltip>
      </md-button>
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
      dropdownVersion: null,
      versions: [],
      docURL: undefined,
      showControls: String(this.$route.query.hideui).toLocaleLowerCase() !== 'true',
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.selectedVersion = to.params.version

    if (!this.selectedVersion){
      this.selectDefaultVersion()
    }

    this.updateDropdownVersion()

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

    if (!this.selectedVersion){
      this.selectDefaultVersion()
    }

    this.updateDropdownVersion()

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
    selectDefaultVersion(){
      this.selectedVersion = (this.getTaggedVersion("latest") || this.versions[this.versions.length - 1]).name;
    },
    updateDropdownVersion(){
      if (!this.versions.map(v => v.name).includes(this.selectedVersion)){
        const tagVersion = this.getTaggedVersion(this.selectedVersion)

        this.dropdownVersion = tagVersion ? tagVersion.name : this.selectedVersion
      }
      else{
        this.dropdownVersion = this.selectedVersion
      }
    },
    getTaggedVersion(tag){
      return this.versions.find(v => (v.tags || []).includes(tag))
    },
    dropdownSelect(){
      if (this.getTaggedVersion(this.selectedVersion)?.name !== this.dropdownVersion){
        this.selectedVersion = this.dropdownVersion
        this.load()
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
      const hideUiParam = this.showControls ? '' : '?hideui=true';

      this.$router.replace(
        `/${this.$route.params.project}/${this.selectedVersion}/${docPath || ''}${hideUiParam}`
      ).catch(() => {})  // NavigationDuplicate
    },
    onHideControlsClick(){
      this.showControls = false;
      this.load()
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
  background: white;
  border-radius: 0px;
  padding: 9px;
  border: 1px solid rgba(0, 0, 0, 0.42);
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
  display: flex;
}

.home-button {
  border-radius: 7px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  margin-right: 0px;
  height: 53px;
  margin-top: 4px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.42);
}

.hide-controls-button {
  border-radius: 7px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 53px;
  box-shadow: none;
  margin-top: 4px;
  margin-left: 0px;
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
