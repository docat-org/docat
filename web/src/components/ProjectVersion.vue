<template>
  <a :href="`/doc/${$route.params.project}/${version}`">
    <div>{{ version }}</div>
  </a>
</template>

<script>
export default {
  name: 'ProjectVersion',
  props: {
    version: String,
  }
}
</script>
