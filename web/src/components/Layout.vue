<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <div class="md-layout toolbar-layout">
        <div class="md-layout-item md-size-15 md-small-hide"></div>
        <div class="md-layout-item">
          <router-link to="/">
            <div v-html="header" />
          </router-link>
          <slot name="toolbar"></slot>
        </div>
        <div class="md-layout-item md-size-15 md-small-hide"></div>
      </div>
    </md-app-toolbar>
    <md-app-content>
      <div class="md-layout">
        <div v-if="!fullscreen" class="md-layout-item md-size-15 md-small-hide"></div>
        <div class="md-layout-item">
          <slot></slot>
          <div class="help" v-if="!fullscreen">
            <router-link to="/help">help</router-link>
          </div>
        </div>
        <div v-if="!fullscreen" class="md-layout-item md-size-15 md-small-hide"></div>
      </div>
    </md-app-content>
  </md-app>
</template>

<script>
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'layout',
  props: {
    fullscreen: Boolean,
  },
  data() {
    const defaultHeader = '<img class="logo" alt="docat logo" src="' + require('../assets/logo.png') + '" /><h1>DOCAT</h1>'
    return {
      header: defaultHeader,
    }
  },
  async created() {
    const config = await ProjectRepository.getConfig()
    if (config.hasOwnProperty('headerHTML')){
      this.header = config.headerHTML
    }
  }
}
</script>

<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: #ececec, // The primary color of your application
  accent: #3a5600 // The accent or secondary color
));

@import "~vue-material/dist/theme/all"; // Apply the theme

.toolbar-layout {
  width: 100%;

  .logo {
    height: 64px;
    float: left;
  }

  h1 {
    float: left;
    color: #742a47;
    margin-top: 25px;
    margin-left: 10px;
  }
}

html,
body,
.md-app {
  height: 100%;
}

a {
  /* TODO: remove hack */
  color: #742a47 !important;
}

.help {
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding-top: 16px;
  margin-top: 16px;

  a {
    margin-left: 50%;
  }
}
</style>