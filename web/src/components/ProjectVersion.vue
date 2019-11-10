<template>
  <md-list-item :to="`/${$route.params.project}/${version}`">{{ version }}</md-list-item>
</template>

<script>
export default {
  name: 'ProjectVersion',
  props: {
    version: String,
  }
}
</script>
