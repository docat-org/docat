<template>
   <Layout>
    <h1>Help</h1>
    <code>curl -X POST -F "file=@docs.zip" http://localhost:8000/api/PROJECT/VERSION</code>

  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'

export default {
  name: 'Help',
  components: {
    Layout
  }
}
</script>