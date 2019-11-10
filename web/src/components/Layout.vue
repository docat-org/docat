<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <div class="md-layout toolbar-layout">
        <div class="md-layout-item md-size-15 md-small-hide"></div>
        <div class="md-layout-item">
          <router-link to="/">
            <img class="logo" alt="docat logo" src="../assets/logo.png" />
            <h1>DOCAT</h1>
          </router-link>
        </div>
        <div class="md-layout-item md-size-15 md-small-hide"></div>
      </div>
    </md-app-toolbar>
    <md-app-content>
      <div class="md-layout">
        <div class="md-layout-item md-size-15 md-small-hide"></div>
        <div class="md-layout-item">
          <slot></slot>
        </div>
        <div class="md-layout-item md-size-15 md-small-hide"></div>
      </div>
    </md-app-content>
  </md-app>
</template>

<script>
export default {
  name: 'layout'
}
</script>

<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: #43001d, // The primary color of your application
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
    color: white;
    margin-top: 25px;
    margin-left: 10px;
  }
}

</style>